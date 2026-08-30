import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, Page, BrowserType } from 'playwright';
import * as dotenv from 'dotenv';
import { decryptEnvFile, encryptEnvFile } from '../utils/env';
import POManager from '../src/pages/POManager';

dotenv.config();

setDefaultTimeout(Number(process.env.TIMEOUT ?? 30000));

function restoreEncryptedEnv() {
  encryptEnvFile();
}

BeforeAll(function () {
  decryptEnvFile();
});

AfterAll(function () {
  restoreEncryptedEnv();
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

Before(async function () {
  const browser: Browser = await browserType.launch({ headless });
  const page: Page = await browser.newPage();

  (this as any).browser = browser;
  (this as any).page = page;
  (this as any).pageManager = new POManager(page);
});

After(async function (scenario: any) {
  const world = this as any;

  if (scenario.result?.status === Status.FAILED && world.page) {
    const screenshot = await world.page.screenshot({ fullPage: true });
    await world.attach(screenshot, 'image/png');
  }

  await world.page?.close();
  await world.browser?.close();
});
