import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AgentPolicy } from '../contracts/rules';
import { ScenarioMemoryStore } from '../adapters/memory/scenario-memory-store';
import { AgentOrchestrator } from '../core/orchestrator';
import { RulesEngine } from '../core/rules-engine';
import { AgentRegistry, SkillRegistry } from '../core/skill-registry';

test('scenario memory is isolated and can be explicitly cleared', async () => {
  const memory = new ScenarioMemoryStore();
  const firstScenario = { kind: 'scenario' as const, id: 'first' };
  const secondScenario = { kind: 'scenario' as const, id: 'second' };

  await memory.write(firstScenario, { key: 'note', value: 'private to first scenario' });
  assert.equal((await memory.read(secondScenario, 'note')), undefined);
  assert.equal((await memory.read(firstScenario, 'note'))?.value, 'private to first scenario');

  await memory.clear(firstScenario);
  assert.equal(await memory.read(firstScenario, 'note'), undefined);
});

test('telemetry rejection does not change agentic skill results', async () => {
  const policy: AgentPolicy = {
    enabled: true,
    allowedAgentIds: ['reviewer'],
    allowedSkillIds: ['summarize'],
    allowedSideEffects: ['read'],
    maxCallsPerRun: 1,
    timeoutMs: 100,
    maxInputChars: 100,
  };
  const agents = new AgentRegistry();
  agents.register({
    id: 'reviewer',
    plan: async () => ({ skillId: 'summarize', input: 'failure detail' }),
  });
  const skills = new SkillRegistry();
  skills.register<string, string>({
    id: 'summarize',
    version: '1',
    description: 'Summarize a supplied diagnostic',
    sideEffects: ['read'],
    validateInput: (value): value is string => typeof value === 'string',
    validateOutput: (value): value is string => typeof value === 'string',
    execute: async (input) => `summary: ${input}`,
  });

  const result = await new AgentOrchestrator({
    agents,
    skills,
    rules: new RulesEngine(policy),
    telemetry: {
      emit: async () => {
        throw new Error('telemetry endpoint unavailable');
      },
    },
  }).run({
    agentId: 'reviewer',
    task: 'summarize the failure',
    context: { runId: 'telemetry-failure', scenarioId: 'scenario-1' },
  });

  assert.deepEqual(result, {
    status: 'completed',
    skillId: 'summarize',
    output: 'summary: failure detail',
  });
});
