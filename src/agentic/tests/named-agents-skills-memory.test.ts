import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import examplePolicy from '../config/rules.example.json';
import type { ModelProvider } from '../contracts/provider';
import { parseAgentPolicy } from '../core/policy-loader';
import { createNamedAgentRegistry } from '../agents/named-agents';
import { FileMemoryStore } from '../adapters/memory/file-memory-store';
import {
  createAccessibilitySkill,
  createAnalysisSkill,
  createApiSkill,
  createAuthSkill,
  createDatabaseSkill,
  createFormSkill,
  createLocatorSkill,
  createNavigationSkill,
  createPlanningSkill,
  createReportingSkill,
  createTestGenerationSkill,
  createValidationSkill,
  createVisualSkill,
} from '../skills/skills';

test('named agents use fixed skill bindings and call a provider only when injected', async () => {
  const registry = createNamedAgentRegistry();
  const idsAndSkills = [
    ['planner', 'analysis.plan'],
    ['executor', 'validation.observe'],
    ['observer', 'visual.observe'],
    ['healing', 'locator.suggest-recovery'],
    ['analysis', 'analysis.review'],
    ['test-generation', 'test-generation.propose'],
  ] as const;
  const requests: Array<{ messages: readonly { role: string; content: string }[]; maxOutputTokens: number }> = [];
  const provider: ModelProvider = {
    complete: async (request) => {
      requests.push(request);
      return { content: 'bounded provider proposal' };
    },
  };

  for (const [agentId, skillId] of idsAndSkills) {
    const agent = registry.get(agentId);
    assert.ok(agent);
    const request = {
      agentId,
      task: 'Review a supplied test observation',
      context: { runId: 'run-1', scenarioId: 'scenario-1' },
    };
    const plan = await agent.plan(request, provider);
    assert.equal(plan.skillId, skillId);
    assert.deepEqual(plan.input, { request: 'bounded provider proposal' });
    const fallback = await agent.plan(request);
    assert.equal(fallback.skillId, skillId);
    assert.deepEqual(fallback.input, { request: request.task });
  }

  assert.equal(requests.length, idsAndSkills.length);
  assert.ok(requests.every((request) => request.messages.length === 2));
  assert.ok(requests.every((request) => request.messages[1].content === 'Review a supplied test observation'));
  assert.ok(requests.every((request) => !JSON.stringify(request.messages).includes('scenario-1')));
});

test('JSON rules example is parsed as disabled and malformed policies fail closed', () => {
  const policy = parseAgentPolicy(examplePolicy);
  assert.equal(policy.enabled, false);
  assert.deepEqual(policy.allowedAgentIds, []);
  assert.deepEqual(policy.allowedSkillIds, []);
  assert.deepEqual(policy.allowedSideEffects, ['read']);
  assert.equal(policy.maxCallsPerRun, 3);

  assert.throws(() => parseAgentPolicy({ ...examplePolicy, enabled: 'true' }), /Invalid agent policy/);
  assert.throws(() => parseAgentPolicy({
    ...examplePolicy,
    allowedSkillIds: ['../outside'],
  }), /Invalid agent policy/);
  assert.throws(() => parseAgentPolicy({
    ...examplePolicy,
    maxInputChars: Number.MAX_SAFE_INTEGER,
  }), /Invalid agent policy/);
});

test('centralized skills expose fixed read-only wrappers with bounded typed inputs', async () => {
  let observed = 0;
  const port = {
    observe: async ({ request }: { request: string }) => {
      observed += 1;
      return { summary: `observed ${request}` };
    },
  };
  const skills = [
    createAccessibilitySkill(port),
    createAnalysisSkill(port),
    createPlanningSkill(port),
    createApiSkill(port),
    createAuthSkill(port),
    createDatabaseSkill(port),
    createFormSkill(port),
    createLocatorSkill(port),
    createNavigationSkill(port),
    createReportingSkill(port),
    createTestGenerationSkill(port),
    createValidationSkill(port),
    createVisualSkill(port),
  ];

  assert.equal(new Set(skills.map((skill) => skill.id)).size, skills.length);
  for (const skill of skills) {
    assert.deepEqual(skill.sideEffects, ['read']);
    assert.equal(skill.validateInput({ request: 'check' }), true);
    assert.equal(skill.validateInput({ request: 'x'.repeat(2_001) }), false);
    assert.equal(skill.validateOutput({ summary: 'ok' }), true);
  }
  const output = await skills[0].execute(
    { request: 'non-mutating probe' },
    { runId: 'run-1' }
  );
  assert.deepEqual(output, { summary: 'observed non-mutating probe' });
  assert.equal(observed, 1);
});

test('file memory supports scoped CRUD, search, expiry, persistence, and atomic replacement', async () => {
  const rootDir = await mkdtemp(join(tmpdir(), 'agentic-memory-'));
  let now = 1_000;
  try {
    const options = {
      rootDir,
      maxEntriesPerScope: 2,
      maxScopes: 3,
      maxKeyChars: 20,
      maxValueChars: 32,
      maxSearchQueryChars: 10,
      maxSearchResults: 2,
      defaultTtlMs: 100,
      now: () => now,
    };
    const store = new FileMemoryStore(options);
    const scenario = { kind: 'scenario' as const, id: 'scenario/../safe' };
    await store.create(scenario, { key: 'first', value: 'A locator was missing' });
    await store.create(scenario, { key: 'second', value: 'A label was hidden' });
    await assert.rejects(
      store.create(scenario, { key: 'first', value: 'duplicate' }),
      /already exists/
    );
    await assert.rejects(
      store.create(scenario, { key: 'third', value: 'overflow' }),
      /entry limit/
    );
    assert.equal((await store.search(scenario, { query: 'LOCATOR', limit: 1 })).length, 1);

    const updated = await store.update(scenario, 'first', { value: 'Updated observation' });
    assert.equal(updated?.value, 'Updated observation');
    await store.write(scenario, { key: 'second', value: 'Upsert remains supported' });
    const reloaded = new FileMemoryStore(options);
    assert.equal((await reloaded.read(scenario, 'second'))?.value, 'Upsert remains supported');
    assert.equal(await reloaded.delete(scenario, 'first'), true);
    assert.equal(await reloaded.delete(scenario, 'first'), false);
    assert.equal((await reloaded.list(scenario)).length, 1);

    const files = await readdir(rootDir);
    assert.ok(files.some((name) => name.endsWith('.json')));
    assert.equal(files.some((name) => name.endsWith('.tmp')), false);

    now += 101;
    assert.equal(await reloaded.read(scenario, 'second'), undefined);
    assert.deepEqual(await reloaded.list(scenario), []);
    assert.equal((await readdir(rootDir)).some((name) => name.endsWith('.json')), false);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test('file memory enforces scope, value, query, and storage budgets', async () => {
  const rootDir = await mkdtemp(join(tmpdir(), 'agentic-memory-limits-'));
  try {
    const store = new FileMemoryStore({
      rootDir,
      maxScopes: 1,
      maxValueChars: 4,
      maxSearchQueryChars: 3,
      maxSearchResults: 1,
      defaultTtlMs: 10,
    });
    await store.write({ kind: 'run', id: 'first' }, { key: 'a', value: 'data' });
    await assert.rejects(
      store.write({ kind: 'run', id: 'second' }, { key: 'b', value: 'data' }),
      /scope limit/
    );
    await assert.rejects(
      store.write({ kind: 'run', id: 'first' }, { key: 'b', value: 'large' }),
      /configured limit/
    );
    await assert.rejects(
      store.search({ kind: 'run', id: 'first' }, { query: 'long', limit: 1 }),
      /Invalid memory search/
    );
    await assert.rejects(
      store.search({ kind: 'run', id: 'first' }, { query: 'x', limit: 2 }),
      /Invalid memory search/
    );
    await assert.rejects(
      store.read({ kind: 'run', id: 'x'.repeat(129) }, 'a'),
      /Invalid memory scope/
    );
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
