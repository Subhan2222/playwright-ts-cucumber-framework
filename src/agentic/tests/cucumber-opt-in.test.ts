import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  diagnoseFailureSafely,
  disposeScenarioRuntime,
  initializeScenarioRuntime,
} from '../integrations/cucumber/lifecycle';
import type { CucumberWorld, ScenarioAgentRuntime } from '../integrations/cucumber/world';
import { createScenarioAgentRuntime } from '../../../support/agentic-runtime';

test('Cucumber lifecycle requires explicit opt-in and an explicit runtime', async () => {
  const world = {
    scenarioId: 'scenario-1',
    scenarioName: 'legacy login flow',
  } as CucumberWorld;
  let factoryCalls = 0;
  const factory = async (): Promise<ScenarioAgentRuntime> => {
    factoryCalls += 1;
    return {
      diagnoseFailure: async () => ({ status: 'completed', output: 'diagnostic only' }),
      dispose: async () => undefined,
    };
  };

  await initializeScenarioRuntime(world, false, factory);
  assert.equal(factoryCalls, 0);
  assert.equal(world.agentRuntime, undefined);
  await assert.rejects(
    initializeScenarioRuntime(world, true),
    /no runtime factory is configured/i,
  );
  await assert.rejects(
    initializeScenarioRuntime(world, true, createScenarioAgentRuntime),
    /implement support\/agentic-runtime\.ts/i,
  );
  assert.equal(factoryCalls, 0);
});

test('Cucumber diagnostics are one-shot and runtime failures stay supplementary', async () => {
  const world = { scenarioName: 'legacy login flow' } as CucumberWorld;
  let diagnosisCalls = 0;
  let disposed = false;
  await initializeScenarioRuntime(world, true, async (scope) => {
    assert.equal(scope.scenarioName, 'legacy login flow');
    return {
      diagnoseFailure: async () => {
        diagnosisCalls += 1;
        throw new Error('optional diagnostic unavailable');
      },
      dispose: async () => {
        disposed = true;
      },
    };
  });

  const observation = {
    scenarioName: 'legacy login flow',
    stepText: 'When I submit the login form',
    errorSummary: 'expected element was not visible',
  };
  assert.equal(await diagnoseFailureSafely(world, observation), undefined);
  assert.equal(await diagnoseFailureSafely(world, observation), undefined);
  assert.equal(diagnosisCalls, 1);

  await disposeScenarioRuntime(world);
  assert.equal(world.agentRuntime, undefined);
  assert.equal(disposed, true);
});
