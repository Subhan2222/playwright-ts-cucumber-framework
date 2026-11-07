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
