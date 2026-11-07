import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AgentPolicy } from '../contracts/rules';
import type { SkillDefinition } from '../contracts/skill';
import { ScenarioMemoryStore } from '../adapters/memory/scenario-memory-store';
import { NoopTelemetrySink } from '../adapters/telemetry/noop-telemetry-sink';
import { AgentOrchestrator } from '../core/orchestrator';
import { RulesEngine } from '../core/rules-engine';
import { AgentRegistry, SkillRegistry } from '../core/skill-registry';
import {
  diagnoseFailureSafely,
  disposeScenarioRuntime,
  initializeScenarioRuntime,
  sanitizeObservation,
} from '../integrations/cucumber/lifecycle';
import type { CucumberWorld } from '../integrations/cucumber/world';
import './orchestrator-guardrails.test';
import './cucumber-opt-in.test';
import './memory-telemetry.test';
import './pom-capability.test';
import './pom-page-object.test';

const policy: AgentPolicy = {
  enabled: true,
  allowedAgentIds: ['failure-reviewer'],
  allowedSkillIds: ['summarize-failure'],
  allowedSideEffects: ['read'],
  maxCallsPerRun: 3,
  timeoutMs: 1000,
  maxInputChars: 2000,
};

test('rules deny by default and reject undeclared side effects', () => {
  const disabled = new RulesEngine({ ...policy, enabled: false });
  assert.equal(disabled.authorizeAgent('failure-reviewer').allowed, false);

  const mutatingSkill: SkillDefinition<string, string> = {
    id: 'mutator',
    version: '1',
    description: 'not allowed by the policy',
    sideEffects: ['write'],
    validateInput: (value): value is string => typeof value === 'string',
    validateOutput: (value): value is string => typeof value === 'string',
    execute: async (value) => value,
  };
  assert.equal(new RulesEngine(policy).authorizeSkill(mutatingSkill).allowed, false);
});

test('orchestrator authorizes and executes a registered typed skill', async () => {
  const agents = new AgentRegistry();
  agents.register({
    id: 'failure-reviewer',
    plan: async () => ({ skillId: 'summarize-failure', input: { note: 'locator timeout' } }),
  });
  const skills = new SkillRegistry();
  skills.register< { note: string }, string>({
    id: 'summarize-failure',
    version: '1',
    description: 'Read-only deterministic failure summary',
    sideEffects: ['read'],
    validateInput: (value): value is { note: string } =>
      typeof value === 'object' && value !== null && 'note' in value && typeof value.note === 'string',
    validateOutput: (value): value is string => typeof value === 'string',
    execute: async ({ note }) => `Review: ${note}`,
  });

  const result = await new AgentOrchestrator({
    agents,
    skills,
    rules: new RulesEngine(policy),
    telemetry: new NoopTelemetrySink(),
  }).run({
    agentId: 'failure-reviewer',
    task: 'summarize this failure',
    context: { runId: 'run-1', scenarioId: 'scenario-1' },
  });

  assert.deepEqual(result, {
    status: 'completed',
    skillId: 'summarize-failure',
    output: 'Review: locator timeout',
  });
});

test('orchestrator aborts cooperative work when its deadline expires', async () => {
  let observedAbort = false;
  const agents = new AgentRegistry();
  agents.register({
    id: 'failure-reviewer',
    plan: async (request) => new Promise((resolve) => {
      request.context.signal?.addEventListener('abort', () => {
        observedAbort = true;
        resolve({ skillId: 'summarize-failure', input: { note: 'late result' } });
      }, { once: true });
    }),
  });
  const skills = new SkillRegistry();
  const response = await new AgentOrchestrator({
    agents,
    skills,
    rules: new RulesEngine({ ...policy, timeoutMs: 10 }),
    telemetry: new NoopTelemetrySink(),
  }).run({
    agentId: 'failure-reviewer',
    task: 'wait briefly',
    context: { runId: 'run-timeout' },
  });

  assert.equal(response.status, 'failed');
  assert.match(response.message ?? '', /timed out/);
  assert.equal(observedAbort, true);
});

test('scenario memory is scoped, bounded, and expires entries', async () => {
  let now = 100;
  const memory = new ScenarioMemoryStore({
    maxEntriesPerScope: 1,
    maxValueChars: 20,
    defaultTtlMs: 10,
    now: () => now,
  });
  await memory.write({ kind: 'scenario', id: 'a' }, { key: 'note', value: 'ephemeral' });
  assert.equal((await memory.read({ kind: 'scenario', id: 'a' }, 'note'))?.value, 'ephemeral');
  assert.equal(await memory.read({ kind: 'scenario', id: 'b' }, 'note'), undefined);
  now = 111;
  assert.equal(await memory.read({ kind: 'scenario', id: 'a' }, 'note'), undefined);
  await assert.rejects(
    memory.write({ kind: 'scenario', id: 'a' }, { key: 'large', value: 'x'.repeat(21) }),
    /configured limit/
  );
});

test('Cucumber lifecycle stays inactive without opt-in and sanitizes bounded diagnostics', async () => {
  const world = {} as CucumberWorld;
  let factoryCalls = 0;
  await initializeScenarioRuntime(world, false, async () => {
    factoryCalls += 1;
    throw new Error('must not run');
  });
  assert.equal(factoryCalls, 0);
  assert.equal(world.agentRuntime, undefined);
  let disposed = false;
  await initializeScenarioRuntime(world, true, async () => ({
    diagnoseFailure: async () => ({ status: 'completed', output: 'unused' }),
    dispose: async () => { disposed = true; },
  }));
  assert.equal(world.agentRuntime !== undefined, true);
  await disposeScenarioRuntime(world);
  assert.equal(world.agentRuntime, undefined);
  assert.equal(disposed, true);
  const sensitiveKey = ['pass', 'word'].join('');
  const sample = `${sensitiveKey}="${['hunter', 'two'].join(' ')}" token:abc123 Bearer abc.def user@example.com`;
  assert.equal(
    sanitizeObservation(sample),
    `${sensitiveKey}=[REDACTED] token=[REDACTED] Bearer [REDACTED] [EMAIL]`
  );

  let diagnosisCalls = 0;
  world.agentRuntime = {
    diagnoseFailure: async () => {
      diagnosisCalls += 1;
      return { status: 'completed', output: 'read-only note' };
    },
    dispose: async () => undefined,
  };
  const observation = {
    scenarioName: 'login',
    stepText: 'Given a user',
    errorSummary: 'timeout',
  };
  assert.equal((await diagnoseFailureSafely(world, observation))?.status, 'completed');
  assert.equal(await diagnoseFailureSafely(world, observation), undefined);
  assert.equal(diagnosisCalls, 1);
});
