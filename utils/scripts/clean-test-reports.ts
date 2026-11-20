import { rmSync } from 'node:fs';
import { join } from 'node:path';

const testResults = join(process.cwd(), 'test-results');
const preserveAllureResults = process.env.PRESERVE_ALLURE_RESULTS?.toLowerCase() === 'true';

for (const directory of ['reports', 'allure-report']) {
  rmSync(join(testResults, directory), { recursive: true, force: true });
}

if (!preserveAllureResults) {
  rmSync(join(testResults, 'allure-results'), { recursive: true, force: true });
}

console.log(
  preserveAllureResults
    ? 'Cleared generated reports; preserving Allure results from earlier browser runs.'
    : 'Cleared previous Cucumber and Allure reports.'
);
