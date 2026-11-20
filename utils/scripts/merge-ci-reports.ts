import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const artifactsRoot = join(process.cwd(), 'downloaded-reports');
const cucumberOutput = join(process.cwd(), 'test-results', 'reports');
const allureOutput = join(process.cwd(), 'test-results', 'allure-results');

if (!existsSync(artifactsRoot)) {
  throw new Error(`Downloaded report artifacts were not found at ${artifactsRoot}.`);
}

const artifactNames = readdirSync(artifactsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (artifactNames.length === 0) {
  throw new Error('No browser/shard report artifacts were downloaded.');
}

rmSync(cucumberOutput, { recursive: true, force: true });
rmSync(allureOutput, { recursive: true, force: true });
mkdirSync(cucumberOutput, { recursive: true });
mkdirSync(allureOutput, { recursive: true });

const cucumberFeatures: JsonRecord[] = [];
let allureFileCount = 0;
let allureResultCount = 0;

function copyAllureResults(
  sourceDirectory: string,
  destinationDirectory: string,
  browser: string,
  shard: string
): void {
  if (!existsSync(sourceDirectory)) {
    return;
  }

  for (const entry of readdirSync(sourceDirectory, { withFileTypes: true })) {
    const source = join(sourceDirectory, entry.name);
    const destination = join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(destination, { recursive: true });
      copyAllureResults(source, destination, browser, shard);
      continue;
    }

    if (existsSync(destination)) {
      throw new Error(`Duplicate Allure result file: ${destination}`);
    }

    if (entry.name.endsWith('-result.json')) {
      const result: unknown = JSON.parse(readFileSync(source, 'utf8'));
      if (!isJsonRecord(result)) {
        throw new Error(`Invalid Allure result JSON: ${source}`);
      }

      const labels: unknown[] = Array.isArray(result.labels) ? result.labels : [];
      result.labels = [
        ...labels,
        { name: 'browser', value: browser },
        { name: 'shard', value: shard },
      ];
      writeFileSync(destination, JSON.stringify(result));
      allureResultCount += 1;
    } else {
      copyFileSync(source, destination);
    }

    allureFileCount += 1;
  }
}

for (const artifactName of artifactNames) {
  const match = /^cucumber-reports-(chromium|firefox|webkit)-shard-(\d+)$/.exec(artifactName);
  if (!match) {
    throw new Error(`Unexpected report artifact name: ${artifactName}`);
  }

  const [, browser, shard] = match;
  const artifactDirectory = join(artifactsRoot, artifactName);
  const cucumberJsonPath = join(artifactDirectory, 'reports', 'cucumber-report.json');

  if (existsSync(cucumberJsonPath)) {
    const features: unknown = JSON.parse(readFileSync(cucumberJsonPath, 'utf8'));
    if (!Array.isArray(features)) {
      throw new Error(`Expected a Cucumber JSON array in ${cucumberJsonPath}`);
    }

    for (const feature of features) {
      if (!isJsonRecord(feature) || typeof feature.name !== 'string') {
        throw new Error(`Invalid Cucumber feature entry in ${cucumberJsonPath}`);
      }
      feature.name = `${feature.name} [${browser}, shard ${shard}]`;
      cucumberFeatures.push(feature);
    }
  } else {
    console.warn(`No Cucumber JSON found in ${artifactName}`);
  }

  copyAllureResults(
    join(artifactDirectory, 'allure-results'),
    allureOutput,
    browser,
    shard
  );
}

if (cucumberFeatures.length === 0) {
  throw new Error('No Cucumber JSON results were found to merge.');
}
if (allureResultCount === 0 || allureFileCount === 0) {
  throw new Error('No Allure result files were found to merge.');
}

writeFileSync(
  join(cucumberOutput, 'cucumber-report.json'),
  `${JSON.stringify(cucumberFeatures, null, 2)}\n`
);

console.log(
  `Merged ${cucumberFeatures.length} Cucumber features and ${allureResultCount} Allure test results across ${artifactNames.length} artifacts.`
);
