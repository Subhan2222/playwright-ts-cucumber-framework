import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OllamaModelProvider } from '../adapters/providers/ollama-model-provider';

test('Ollama provider sends a non-streaming chat request and returns its content', async () => {
  let observedUrl = '';
  let observedBody: Record<string, unknown> | undefined;
  const provider = new OllamaModelProvider(
    'http://localhost:11434/',
    'qwen3:4b',
    async (input, init) => {
      observedUrl = String(input);
      observedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return Response.json({ message: { content: 'Check the login redirect.' } });
    }
  );

  const result = await provider.complete({
    messages: [{ role: 'user', content: 'Review this test failure.' }],
    maxOutputTokens: 120,
  });

  assert.equal(observedUrl, 'http://localhost:11434/api/chat');
  assert.equal(observedBody?.model, 'qwen3:4b');
  assert.equal(observedBody?.stream, false);
  assert.equal(observedBody?.think, false);
  assert.equal(result.content, 'Check the login redirect.');
});

test('Ollama provider reports HTTP errors and malformed responses', async () => {
  const unavailable = new OllamaModelProvider(
    'http://localhost:11434',
    'qwen3:4b',
    async () => new Response('model not found', { status: 404 })
  );
  await assert.rejects(
    unavailable.complete({ messages: [], maxOutputTokens: 10 }),
    /Ollama request failed with HTTP 404: model not found/
  );

  const malformed = new OllamaModelProvider(
    'http://localhost:11434',
    'qwen3:4b',
    async () => Response.json({ message: { content: '' } })
  );
  await assert.rejects(
    malformed.complete({ messages: [], maxOutputTokens: 10 }),
    /Ollama returned no message content/
  );
});
