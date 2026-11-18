import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  PomCapabilityPolicy,
  PomReadExecutor,
} from '../contracts/pom-capability';
import { createPolicyCheckedPomCapability } from '../core/pom-capability';
import {
  createScenarioPomCapability,
  pomPolicyFromEnvironment,
} from '../integrations/cucumber/pom-capability';
import { initializeScenarioRuntime } from '../integrations/cucumber/lifecycle';
import type { CucumberWorld, ScenarioAgentRuntime } from '../integrations/cucumber/world';

const policy: PomCapabilityPolicy = {
  enabled: true,
  allowedActions: ['dashboard.verify-menu'],
  maxCalls: 1,
  maxInputChars: 12,
};

test('POM capability is default-deny and exposes only its invoke operation', async () => {
  let executions = 0;
  const executor: PomReadExecutor = {
    verifyDashboardMenu: async () => { executions += 1; return true; },
    verifySearchResults: async () => { executions += 1; return true; },
    verifyMenuHidden: async () => { executions += 1; return true; },
  };
  const capability = createPolicyCheckedPomCapability(executor, {
    ...policy,
    enabled: false,
    allowedActions: [],
  });

  assert.deepEqual(Reflect.ownKeys(capability), ['invoke']);
  assert.deepEqual(
    await capability.invoke({ kind: 'dashboard.verify-menu', menuOption: 'Admin' }),
    {
      status: 'denied',
      action: undefined,
      message: 'POM capability is disabled',
    }
  );
  assert.equal(executions, 0);
});

test('POM capability checks allowlist, input size, and concurrent-safe call budget', async () => {
  const calls: string[] = [];
  const capability = createPolicyCheckedPomCapability({
    verifyDashboardMenu: async (menuOption) => { calls.push(menuOption); return true; },
    verifySearchResults: async (searchItem) => { calls.push(searchItem); return false; },
    verifyMenuHidden: async () => { calls.push('hidden'); return true; },
  }, policy);

  assert.equal((await capability.invoke({
    kind: 'dashboard.verify-search-results',
    searchItem: 'Admin',
  })).status, 'denied');
  assert.equal((await capability.invoke({
    kind: 'dashboard.verify-menu',
    menuOption: 'Admin menu too long',
  })).status, 'denied');
  const simultaneousCalls = await Promise.all([
    capability.invoke({ kind: 'dashboard.verify-menu', menuOption: 'Admin' }),
    capability.invoke({ kind: 'dashboard.verify-menu', menuOption: 'PIM' }),
  ]);
  assert.equal(simultaneousCalls.filter((result) => result.status === 'completed').length, 1);
  assert.deepEqual(
    simultaneousCalls.find((result) => result.status === 'completed'),
    { status: 'completed', action: 'dashboard.verify-menu', observed: true }
  );
  assert.equal(simultaneousCalls.filter((result) => result.status === 'denied').length, 1);
  assert.deepEqual(calls, ['Admin']);
});

test('POM capability rejects malformed actions and does not leak Page Object errors', async () => {
  const capability = createPolicyCheckedPomCapability({
    verifyDashboardMenu: async () => { throw new Error('password=do-not-disclose'); },
    verifySearchResults: async () => false,
    verifyMenuHidden: async () => false,
  }, policy);

  assert.equal((await capability.invoke({ kind: 'unexpected' } as never)).status, 'denied');
  assert.deepEqual(
    await capability.invoke({ kind: 'dashboard.verify-menu', menuOption: 'Admin' }),
    {
      status: 'failed',
      action: 'dashboard.verify-menu',
      message: 'POM operation failed',
    }
  );
});

test('scenario POM capability keeps Page Object access inside trusted closures', async () => {
  const world = {} as CucumberWorld;
  const capability = createScenarioPomCapability(world, policy);
  const result = await capability.invoke({
    kind: 'dashboard.verify-menu',
    menuOption: 'Admin',
  });
  assert.equal(result.status, 'failed');
  assert.deepEqual(Reflect.ownKeys(capability), ['invoke']);
});

test('runtime factory receives only scenario identifiers and the explicitly supplied capability', async () => {
  const capability = createPolicyCheckedPomCapability({
    verifyDashboardMenu: async () => true,
    verifySearchResults: async () => true,
    verifyMenuHidden: async () => true,
  }, policy);
  const world = {
    scenarioId: 'scenario-1',
    scenarioName: 'dashboard',
    page: { secret: 'must not be forwarded' },
    pageManager: { secret: 'must not be forwarded' },
  } as unknown as CucumberWorld;
  let receivedScope: unknown;
  const runtime: ScenarioAgentRuntime = {
    diagnoseFailure: async () => ({ status: 'completed' }),
    suggestLocatorRecovery: async () => undefined,
    dispose: async () => undefined,
  };

  await initializeScenarioRuntime(world, true, async (scope) => {
    receivedScope = scope;
    return runtime;
  }, capability);

  assert.deepEqual(Object.keys(receivedScope as object).sort(), [
    'pomCapability',
    'scenarioId',
    'scenarioName',
  ]);
  assert.equal((receivedScope as { pomCapability: unknown }).pomCapability, capability);
  assert.equal('page' in (receivedScope as object), false);
  assert.equal('pageManager' in (receivedScope as object), false);
});

test('runtime factory receives no POM capability unless it was explicitly supplied', async () => {
  const world = {
    scenarioId: 'scenario-2',
    scenarioName: 'legacy scenario',
  } as CucumberWorld;
  const runtime: ScenarioAgentRuntime = {
    diagnoseFailure: async () => ({ status: 'completed' }),
    suggestLocatorRecovery: async () => undefined,
    dispose: async () => undefined,
  };
  let receivedScope: unknown;

  await initializeScenarioRuntime(world, true, async (scope) => {
    receivedScope = scope;
    return runtime;
  });

  assert.deepEqual(Object.keys(receivedScope as object).sort(), [
    'scenarioId',
    'scenarioName',
  ]);
});

test('POM capability environment policy requires separate opt-in and explicit actions', () => {
  assert.deepEqual(pomPolicyFromEnvironment(false, 'dashboard.verify-menu'), {
    enabled: false,
    allowedActions: [],
    maxCalls: 5,
    maxInputChars: 120,
  });
  assert.deepEqual(
    pomPolicyFromEnvironment(true, 'dashboard.verify-menu, dashboard.verify-menu'),
    {
      enabled: true,
      allowedActions: ['dashboard.verify-menu'],
      maxCalls: 5,
      maxInputChars: 120,
    }
  );
  assert.throws(
    () => pomPolicyFromEnvironment(true, 'page.evaluate'),
    /unsupported action/i
  );
});
