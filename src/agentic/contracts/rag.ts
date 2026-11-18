import type { KnowledgeMatch } from './knowledge';

export interface RagRequest {
  readonly query: string;
  readonly namespace: string;
  readonly limit: number;
  readonly maxContextChars: number;
}

export interface RagResult {
  readonly matches: readonly KnowledgeMatch[];
  readonly context: string;
}

/** Retrieval and context assembly contract; implementations are injected. */
export interface RagPipeline {
  retrieve(request: RagRequest): Promise<RagResult>;
}
