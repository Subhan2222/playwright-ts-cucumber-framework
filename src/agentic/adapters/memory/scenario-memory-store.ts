import type { MemoryEntry, MemoryScope, MemoryStore } from '../../contracts/memory';

export interface ScenarioMemoryOptions {
  readonly maxEntriesPerScope?: number;
  readonly maxValueChars?: number;
  readonly defaultTtlMs?: number;
  readonly now?: () => number;
}

/** Ephemeral in-process memory. It is intentionally not persisted or shared. */
export class ScenarioMemoryStore implements MemoryStore {
  private readonly scopes = new Map<string, Map<string, MemoryEntry>>();
  private readonly maxEntriesPerScope: number;
  private readonly maxValueChars: number;
  private readonly defaultTtlMs: number;
  private readonly now: () => number;

  constructor(options: ScenarioMemoryOptions = {}) {
    this.maxEntriesPerScope = options.maxEntriesPerScope ?? 100;
    this.maxValueChars = options.maxValueChars ?? 4000;
    this.defaultTtlMs = options.defaultTtlMs ?? 30 * 60 * 1000;
    this.now = options.now ?? Date.now;
  }

  async read(scope: MemoryScope, key: string): Promise<MemoryEntry | undefined> {
    const entries = this.scopes.get(this.scopeKey(scope));
    const entry = entries?.get(key);
    if (entry?.expiresAt !== undefined && entry.expiresAt <= this.now()) {
      entries?.delete(key);
      return undefined;
    }
    return entry;
  }

  async write(scope: MemoryScope, entry: MemoryEntry): Promise<void> {
    if (entry.value.length > this.maxValueChars) throw new Error('Memory value exceeds configured limit');
    const key = this.scopeKey(scope);
    let entries = this.scopes.get(key);
    if (!entries) {
      entries = new Map<string, MemoryEntry>();
      this.scopes.set(key, entries);
    }
    if (!entries.has(entry.key) && entries.size >= this.maxEntriesPerScope) {
      throw new Error('Memory scope entry limit reached');
    }
    entries.set(entry.key, {
      ...entry,
      expiresAt: entry.expiresAt ?? this.now() + this.defaultTtlMs,
    });
  }

  async clear(scope: MemoryScope): Promise<void> {
    this.scopes.delete(this.scopeKey(scope));
  }

  private scopeKey(scope: MemoryScope): string {
    return `${scope.kind}:${scope.id}`;
  }
}
