export interface VectorRecord {
  readonly id: string;
  readonly namespace: string;
  readonly vector: readonly number[];
  readonly metadata: Readonly<Record<string, string>>;
}

export interface VectorMatch {
  readonly record: VectorRecord;
  readonly score: number;
}

/** Storage contract only; persistence and tenant policy belong to adapters. */
export interface VectorStore {
  upsert(records: readonly VectorRecord[]): Promise<void>;
  search(
    namespace: string,
    vector: readonly number[],
    limit: number
  ): Promise<readonly VectorMatch[]>;
  deleteNamespace(namespace: string): Promise<void>;
}
