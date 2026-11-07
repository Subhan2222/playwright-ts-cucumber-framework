import { BeforeAll, AfterAll, Before, After, BeforeStep, AfterStep, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserType } from 'playwright';
import * as dotenv from 'dotenv';
import { decryptEnvFile } from '../utils/envConfig';
import POManager from '../src/pages/POManager';
import { setDefaultTimeout } from '@cucumber/cucumber';
import type { ITestCaseHookParameter, ITestStepHookParameter } from '@cucumber/cucumber';
import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { CucumberWorld } from '../src/agentic/integrations/cucumber/world';
import {
    diagnoseFailureSafely,
    disposeScenarioRuntime,
    initializeScenarioRuntime,
} from '../src/agentic/integrations/cucumber/lifecycle';
import { createScenarioAgentRuntime } from './agentic-runtime';

setDefaultTimeout(Number(process.env.TIMEOUT ?? 60000));
dotenv.config();

const headless = process.env.HEADLESS?.toLowerCase() !== 'false';
const browserName = (process.env.BROWSER ?? 'chromium').toLowerCase();
const browserType: BrowserType<Browser> =
    browserName === 'firefox' ? firefox :
    browserName === 'webkit' ? webkit : chromium;

let globalBrowser: Browser;

BeforeAll(async function () {
    await decryptEnvFile();
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

Before(async function (this: CucumberWorld, { pickle }: ITestCaseHookParameter) {
    this.scenarioId = pickle.id;
    this.scenarioName = pickle.name;
    await initializeScenarioRuntime(
        this,
        process.env.AGENTIC_TESTS_ENABLED?.toLowerCase() === 'true',
        createScenarioAgentRuntime
    );
    this.context = await globalBrowser.newContext({
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true
    });

    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });

    this.page = await this.context.newPage();

    this.pageManager = new POManager(this.page);
});

After(async function (this: CucumberWorld, scenario: ITestCaseHookParameter) {
    const status = scenario.result?.status ?? Status.UNKNOWN;

    try {
        if (status === Status.FAILED) {
            const errorMessage = scenario.result?.message ?? 'No error message returned';
            await this.attach(errorMessage, 'text/plain');

            if (this.page && this.context) {
                let tracePath: string | undefined;
                try {
                    const screenshot = await this.page.screenshot({ fullPage: true });
                    await this.attach(screenshot, 'image/png');

                    tracePath = join(tmpdir(), `cucumber-trace-${randomUUID()}.zip`);
                    await this.context.tracing.stop({ path: tracePath });
                    await this.attach(await readFile(tracePath), 'application/zip');
                } catch (artifactError) {
                    console.error('[Scenario Artifacts] Failed to construct triage packages');
                } finally {
                    if (tracePath) await rm(tracePath, { force: true }).catch(() => undefined);
                }
            }
        } else if (this.context) {
            await this.context.tracing.stop();
        }
    } finally {
        try {
            if (this.page) await this.page.close();
        } finally {
            try {
                if (this.context) await this.context.close();
            } finally {
                try {
                    await disposeScenarioRuntime(this);
                } catch {
                    console.error('[Agentic Runtime] Failed to dispose scenario runtime');
                }
            }
        }
    }
});

BeforeStep(function ({ pickleStep }) {
    console.log(`[STEP START] ${pickleStep.text}`);
});

AfterStep(async function (this: CucumberWorld, { pickleStep, result }: ITestStepHookParameter) {
    const rawMessage = result?.exception?.message ?? result?.message ?? 'Step failed';
    const cleanMessage = String(rawMessage).split('\n')[0].trim();

    if (result.status === Status.PASSED) {
        console.log(`[STEP PASS] ${pickleStep.text}`);
        return;
    }

    if (result.status === Status.FAILED) {
        console.error(`[STEP FAIL] ${pickleStep.text} :: ${cleanMessage}`);
        const diagnostic = await diagnoseFailureSafely(this, {
            scenarioName: this.scenarioName ?? 'Unknown scenario',
            stepText: pickleStep.text,
            errorSummary: cleanMessage,
        });
        if (diagnostic?.status === 'completed' && typeof diagnostic.output === 'string') {
            try {
                await this.attach(diagnostic.output.slice(0, 4000), 'text/plain');
            } catch {
                console.error('[Agentic Runtime] Failed to attach diagnostic output');
            }
        } else if (diagnostic?.message) {
            try {
                await this.attach(diagnostic.message.slice(0, 4000), 'text/plain');
            } catch {
                console.error('[Agentic Runtime] Failed to attach diagnostic result');
            }
        }
    }
});
