import { BeforeAll, AfterAll, Before, After, BeforeStep, AfterStep, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserType } from 'playwright';
import * as dotenv from 'dotenv';
import { decryptEnvFile } from '../utils/env';
import POManager from '../src/pages/POManager';
import { setDefaultTimeout } from '@cucumber/cucumber';

setDefaultTimeout(Number(process.env.TIMEOUT ?? 60000));
dotenv.config();

const headless = process.env.HEADLESS?.toLowerCase() !== 'false';
const browserName = (process.env.BROWSER ?? 'chromium').toLowerCase();
const browserType: BrowserType<Browser> =
    browserName === 'firefox' ? firefox :
    browserName === 'webkit' ? webkit : chromium;

let globalBrowser: Browser;

BeforeAll(async function () {
    decryptEnvFile();
    globalBrowser = await browserType.launch({
        headless,
        args: ['--disable-dev-shm-usage', '--no-sandbox']
    });
});

AfterAll(async function () {
    if (globalBrowser) {
        await globalBrowser.close();
    }
});

Before(async function (this: any) {
    this.context = await globalBrowser.newContext({
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true
    });

    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });

    this.page = await this.context.newPage();

    this.pageManager = new POManager(this.page);
});

After(async function (this: any, scenario: any) {
    const status = scenario.result?.status ?? Status.UNKNOWN;

    if (status === Status.FAILED) {
        const errorMessage = scenario.result?.message ?? 'No error message returned';
        await this.attach(errorMessage, 'text/plain');

        if (this.page && this.context) {
            try {
                const screenshot = await this.page.screenshot({ fullPage: true });
                await this.attach(screenshot, 'image/png');

                const traceBuffer = await this.context.tracing.stop({ stdout: false });
                if (traceBuffer) {
                    await this.attach(traceBuffer, 'application/zip');
                }
            } catch (artifactError) {
                console.error('[Scenario Artifacts] Failed to construct triage packages');
            }
        }
    } else if (this.context) {
        await this.context.tracing.stop();
    }

    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
});

BeforeStep(function ({ pickleStep }) {
    console.log(`[STEP START] ${pickleStep.text}`);
});

AfterStep(function ({ pickleStep, result }) {
    const rawMessage = result?.exception?.message ?? result?.message ?? 'Step failed';
    const cleanMessage = String(rawMessage).split('\n')[0].trim();

    if (result.status === Status.PASSED) {
        console.log(`[STEP PASS] ${pickleStep.text}`);
        return;
    }

    if (result.status === Status.FAILED) {
        console.error(`[STEP FAIL] ${pickleStep.text} :: ${cleanMessage}`);
    }
});
