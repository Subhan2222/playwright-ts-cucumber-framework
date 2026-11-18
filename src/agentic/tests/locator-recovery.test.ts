import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createScenarioAgentRuntime } from '../../../support/agentic-runtime';
import type { ModelProvider, ModelRequest } from '../contracts/provider';
import type { LocatorRecoveryRequest } from '../integrations/cucumber/locator-recovery';

const request: LocatorRecoveryRequest = {
  action: 'click',
  target: 'getByRole button name Login When the user clicks Login',
  candidates: [
    { id: 'c1', strategy: 'role', role: 'button', value: 'Login', description: 'button named "Login"' },
    { id: 'c2', strategy: 'role', role: 'button', value: 'Cancel', description: 'button named "Cancel"' },
  ],
};

test('agentic locator recovery asks the provider to choose an existing candidate', async () => {
  let sentRequest: ModelRequest | undefined;
  const provider: ModelProvider = {
    complete: async (value) => {
      sentRequest = value;
      return { content: '{"candidateId":"c1"}' };
    },
  };
  const runtime = await createScenarioAgentRuntime({}, provider);

  assert.equal(await runtime.suggestLocatorRecovery(request), 'c1');
  assert.match(sentRequest?.messages[0].content ?? '', /Choose only the single candidate/);
  assert.match(sentRequest?.messages[1].content ?? '', /"id":"c1"/);
  assert.doesNotMatch(sentRequest?.messages[1].content ?? '', /"value":"Login"/);
});

test('agentic locator recovery rejects unknown, ambiguous, and invalid model output', async () => {
  for (const content of [
    '{"candidateId":"c999"}',
    '{"candidateId":null}',
    'c1',
    'not json',
  ]) {
    const runtime = await createScenarioAgentRuntime({}, {
      complete: async () => ({ content }),
    });
    assert.equal(await runtime.suggestLocatorRecovery(request), undefined, content);
  }
});
