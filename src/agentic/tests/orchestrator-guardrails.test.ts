import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AgentPolicy } from '../contracts/rules';
import type { SkillDefinition } from '../contracts/skill';
import { NoopTelemetrySink } from '../adapters/telemetry/noop-telemetry-sink';
import { AgentOrchestrator } from '../core/orchestrator';
import { RulesEngine } from '../core/rules-engine';
import { AgentRegistry, SkillRegistry } from '../core/skill-registry';

const policy: AgentPolicy = {
  enabled: true,
  allowedAgentIds: ['reviewer'],
  allowedSkillIds: ['read-only-review'],
  allowedSideEffects: ['read'],
  maxCallsPerRun: 1,
  timeoutMs: 100,
  maxInputChars: 200,
};

test('unapproved agents and skills cannot execute', async () => {
  let agentCalls = 0;
  let skillCalls = 0;
  const agents = new AgentRegistry();
  agents.register({
    id: 'reviewer',
    plan: async () => {
      agentCalls += 1;
      return { skillId: 'write-report', input: 'report' };
    },
  });
  const skills = new SkillRegistry();
  const writeSkill: SkillDefinition<string, string> = {
    id: 'write-report',
    version: '1',
    description: 'Not allowlisted and declares a write effect',
    sideEffects: ['write'],
    validateInput: (value): value is string => typeof value === 'string',
    validateOutput: (value): value is string => typeof value === 'string',
    execute: async (value) => {
      skillCalls += 1;
      return value;
    },
  };
  skills.register(writeSkill);
  const orchestrator = new AgentOrchestrator({
    agents,
    skills,
    rules: new RulesEngine(policy),
    telemetry: new NoopTelemetrySink(),
  });

  const deniedAgent = await orchestrator.run({
    agentId: 'untrusted',
    task: 'review',
    context: { runId: 'guardrails' },
  });
  const deniedSkill = await orchestrator.run({
    agentId: 'reviewer',
    task: 'review',
    context: { runId: 'guardrails' },
  });

  assert.equal(deniedAgent.status, 'denied');
  assert.equal(deniedSkill.status, 'denied');
  assert.match(deniedSkill.message ?? '', /not allowlisted|side effect is not allowed/i);
  assert.equal(agentCalls, 1);
  assert.equal(skillCalls, 0);
});

test('per-run budget and input validation stop excess or malformed work', async () => {
  const agents = new AgentRegistry();
  let agentCalls = 0;
  agents.register({
    id: 'reviewer',
    plan: async () => {
      agentCalls += 1;
      return { skillId: 'read-only-review', input: 42 };
    },
  });
  const skills = new SkillRegistry();
  skills.register<string, string>({
    id: 'read-only-review',
    version: '1',
    description: 'Accepts text only',
    sideEffects: ['read'],
    validateInput: (value): value is string => typeof value === 'string',
    validateOutput: (value): value is string => typeof value === 'string',
    execute: async () => 'should not execute',
  });
  const orchestrator = new AgentOrchestrator({
    agents,
    skills,
    rules: new RulesEngine(policy),
    telemetry: new NoopTelemetrySink(),
  });

  const malformed = await orchestrator.run({
    agentId: 'reviewer',
    task: 'review',
    context: { runId: 'budget' },
  });
  const overBudget = await orchestrator.run({
    agentId: 'reviewer',
    task: 'review again',
    context: { runId: 'budget' },
  });

  assert.equal(malformed.status, 'failed');
  assert.match(malformed.message ?? '', /input validation/i);
  assert.equal(overBudget.status, 'denied');
  assert.match(overBudget.message ?? '', /budget exhausted/i);
  assert.equal(agentCalls, 1);
});
