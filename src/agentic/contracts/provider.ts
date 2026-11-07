export interface ModelMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

export interface ModelRequest {
  readonly messages: readonly ModelMessage[];
  readonly maxOutputTokens: number;
  readonly signal?: AbortSignal;
}

export interface ModelResponse {
  readonly content: string;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
}

/** Vendor-neutral. No provider implementation or credentials are bundled. */
export interface ModelProvider {
  complete(request: ModelRequest): Promise<ModelResponse>;
}
