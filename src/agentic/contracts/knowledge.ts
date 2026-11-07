export interface KnowledgeDocument {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly source: string;
  readonly tags?: readonly string[];
}

export interface KnowledgeSource {
  list(): Promise<readonly KnowledgeDocument[]>;
}

export interface KnowledgeMatch {
  readonly document: KnowledgeDocument;
  readonly score: number;
}

export interface KnowledgeRetriever {
  search(query: string, limit: number): Promise<readonly KnowledgeMatch[]>;
}

export interface EmbeddingProvider {
  embed(text: string): Promise<readonly number[]>;
}
