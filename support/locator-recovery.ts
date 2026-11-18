import { createInterface } from 'node:readline/promises';
import type { LocatorRecoveryService } from '../src/agentic/integrations/cucumber/locator-recovery';
import type { CucumberWorld } from '../src/agentic/integrations/cucumber/world';

const SUGGESTION_TIMEOUT_MS = 30_000;

export function createScenarioLocatorRecovery(
  world: CucumberWorld
): LocatorRecoveryService {
  return {
    suggest: async (request) => {
      if (!world.agentRuntime) {
        throw new Error('Agentic locator recovery requires an initialized scenario agent runtime.');
      }

      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          world.agentRuntime.suggestLocatorRecovery(request, controller.signal),
          new Promise<undefined>((resolve) => {
            timer = setTimeout(() => {
              controller.abort();
              console.warn('[Agentic Self-Healing] Locator suggestion timed out.');
              resolve(undefined);
            }, SUGGESTION_TIMEOUT_MS);
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
    },
    approve: async (candidate, action) => {
      if (!process.stdin.isTTY || !process.stdout.isTTY || process.env.CUCUMBER_WORKER_ID) {
        return false;
      }

      const prompt = createInterface({ input: process.stdin, output: process.stdout });
      try {
        const answer = await prompt.question(
          `\n[Self-healing approval] Retry ${action} using ${candidate.description}? [y/N] `
        );
        return answer.trim().toLowerCase() === 'y';
      } finally {
        prompt.close();
      }
    },
    report: async (message) => {
      console.log(`[SELF-HEALING]\n${message}`);
      try {
        await world.attach(`SELF-HEALING REPORT\n${message}`, 'text/plain');
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'Unknown attachment error';
        console.error(`[Self-healing] Could not attach report: ${detail}`);
      }
    },
  };
}
