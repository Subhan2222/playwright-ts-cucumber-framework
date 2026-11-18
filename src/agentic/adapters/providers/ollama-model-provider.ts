import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
} from '../../contracts/provider';

interface OllamaChatResponse {
  readonly message?: {
    readonly content?: unknown;
  };
  readonly error?: unknown;
}

export class OllamaModelProvider implements ModelProvider {
  private readonly baseUrl: string;

  constructor(
    baseUrl = process.env.OLLAMA_BASE_URL?.trim() || 'http://127.0.0.1:11434',
    private readonly model = process.env.OLLAMA_MODEL?.trim() || 'qwen3:4b',
    private readonly fetchImpl: typeof fetch = fetch
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    if (!this.baseUrl) throw new Error('OLLAMA_BASE_URL must not be empty.');
    if (!this.model) throw new Error('OLLAMA_MODEL must not be empty.');
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        stream: false,
        think: false,
        options: { num_predict: request.maxOutputTokens },
      }),
      signal: request.signal,
    });

    if (!response.ok) {
      const details = (await response.text()).slice(0, 400);
      throw new Error(
        `Ollama request failed with HTTP ${response.status}${details ? `: ${details}` : ''}`
      );
    }

    const result: unknown = await response.json();
    if (!isOllamaChatResponse(result)) {
      throw new Error('Ollama returned an invalid chat response.');
    }

    const content = result.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      const reason = typeof result.error === 'string' ? `: ${result.error}` : '';
      throw new Error(`Ollama returned no message content${reason}`);
    }

    return { content };
  }
}

function isOllamaChatResponse(value: unknown): value is OllamaChatResponse {
  return typeof value === 'object' && value !== null;
}
