import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  BeforeStep,
  AfterStep,
  Status,
} from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, Page, BrowserType } from 'playwright';
import * as dotenv from 'dotenv';
import { decryptEnvFile, encryptEnvFile } from '../utils/env';
import POManager from '../src/pages/POManager';
import { setDefaultTimeout } from '@cucumber/cucumber';

setDefaultTimeout(Number(process.env.TIMEOUT ?? 60000));

dotenv.config();

function restoreEncryptedEnv() {
  encryptEnvFile();
}

BeforeAll(function () {
  console.log(`[Run] START | browser=${browserName} | headless=${headless}`);
  decryptEnvFile();
  console.log('[Run] Environment loaded');
});

AfterAll(function () {
  console.log('[Run] FINISHED');
  restoreEncryptedEnv();
  console.log('[Run] Environment restored');
});

process.on('exit', restoreEncryptedEnv);


const headless = process.env.HEADLESS?.toLowerCase() !== 'false';
const browserName = (process.env.BROWSER ?? 'chromium').toLowerCase();

const browserType: BrowserType<Browser> =
  browserName === 'firefox'
    ? firefox
    : browserName === 'webkit'
    ? webkit
    : chromium;

Before(async function ({ pickle }) {
  (this as any).scenarioStartedAt = Date.now();
  console.log(`[Scenario] START | ${pickle.name}`);

  const browser: Browser = await browserType.launch({ headless });
  const page: Page = await browser.newPage();

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      console.warn(`[Browser console.${message.type()}] ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    console.error(`[Browser page error] ${error.message}`);
  });
  page.on('requestfailed', (request) => {
    console.error(
      `[Browser request failed] ${request.method()} ${request.url()} | ${request.failure()?.errorText ?? 'unknown error'}`,
    );
  });

  (this as any).browser = browser;
  (this as any).page = page;
  (this as any).pageManager = new POManager(page);
  console.log(`[Scenario] Browser ready | ${browserName}`);
});

BeforeStep(function ({ pickleStep }) {
  console.log(`[Step] START | ${pickleStep.text}`);
});

AfterStep(function ({ pickleStep, result }) {
  const duration = result.duration
    ? `${result.duration.seconds}s ${result.duration.nanos}ns`
    : 'unknown duration';
  console.log(`[Step] ${result.status} | ${pickleStep.text} | ${duration}`);
});

After(async function (scenario: any) {
  const world = this as any;
  const duration = world.scenarioStartedAt
    ? `${Date.now() - world.scenarioStartedAt}ms`
    : 'unknown duration';
  const status = scenario.result?.status ?? Status.UNKNOWN;

  console.log(`[Scenario] ${status} | ${scenario.pickle?.name ?? 'unknown'} | ${duration}`);

  if (status === Status.FAILED) {
    const errorMessage = scenario.result?.message ?? 'No error message was provided';
    console.error(`[Error] ${errorMessage}`);
    await world.attach(errorMessage, 'text/plain');

    if (world.page) {
      try {
        console.log('[Scenario] Capturing failure screenshot');
        const screenshot = await world.page.screenshot({ fullPage: true });
        await world.attach(screenshot, 'image/png');
        console.log('[Scenario] Failure screenshot attached');
      } catch (error) {
        console.error('[Scenario] Failed to capture screenshot', error);
      }
    } else {
      console.warn('[Scenario] No page available for failure screenshot');
    }
  }

  await world.page?.close();
  await world.browser?.close();
  console.log('[Scenario] Browser resources closed');
});
