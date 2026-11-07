export interface MemoryScope {
  readonly kind: 'scenario' | 'run' | 'project';
  readonly id: string;
}

export interface MemoryEntry {
  readonly key: string;
  readonly value: string;
  readonly expiresAt?: number;
}

export interface MemoryStore {
  read(scope: MemoryScope, key: string): Promise<MemoryEntry | undefined>;
  write(scope: MemoryScope, entry: MemoryEntry): Promise<void>;
  clear(scope: MemoryScope): Promise<void>;
}

export interface MemorySearchOptions {
  /** Case-insensitive substring search over keys and values in one scope only. */
  readonly query: string;
  readonly limit: number;
}

/**
 * Optional richer persistence contract. `write` remains an upsert for
 * compatibility with existing MemoryStore implementations.
 */
export interface CrudMemoryStore extends MemoryStore {
  create(scope: MemoryScope, entry: MemoryEntry): Promise<void>;
  update(
    scope: MemoryScope,
    key: string,
    changes: Partial<Pick<MemoryEntry, 'value' | 'expiresAt'>>
  ): Promise<MemoryEntry | undefined>;
  delete(scope: MemoryScope, key: string): Promise<boolean>;
  list(scope: MemoryScope): Promise<readonly MemoryEntry[]>;
  search(scope: MemoryScope, options: MemorySearchOptions): Promise<readonly MemoryEntry[]>;
}
