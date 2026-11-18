import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  diagnoseFailureSafely,
  disposeScenarioRuntime,
  formatAgentDiagnosticReport,
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
      suggestLocatorRecovery: async () => undefined,
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
  await initializeScenarioRuntime(world, true, createScenarioAgentRuntime);
  await disposeScenarioRuntime(world);
  assert.equal(world.agentRuntime, undefined);
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
      suggestLocatorRecovery: async () => undefined,
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
  const result = await diagnoseFailureSafely(world, observation);
  assert.equal(result?.status, 'failed');
  assert.match(result?.message ?? '', /optional diagnostic unavailable/);
  assert.equal(await diagnoseFailureSafely(world, observation), undefined);
  assert.equal(diagnosisCalls, 1);

  await disposeScenarioRuntime(world);
  assert.equal(world.agentRuntime, undefined);
  assert.equal(disposed, true);
});

test('agentic report attachment includes diagnosis context and a clear advisory label', () => {
  const report = formatAgentDiagnosticReport(
    {
      scenarioName: 'login',
      stepText: 'Then password is visible',
      errorSummary: 'password="private value"',
    },
    { status: 'completed', output: 'Check the login form state.' },
    'qwen3:4b'
  );

  assert.match(report, /AGENTIC FAILURE ANALYSIS/);
  assert.match(report, /Provider: Ollama/);
  assert.match(report, /Model: qwen3:4b/);
  assert.match(report, /Scenario: login/);
  assert.match(report, /Diagnosis: Check the login form state\./);
  assert.match(report, /password=\[REDACTED\]/);
  assert.match(report, /Cucumber test status is unchanged/);
});
