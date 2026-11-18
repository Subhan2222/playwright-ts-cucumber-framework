import { constants } from 'node:fs';
import { mkdir, open, readdir, rename, unlink, lstat } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { join, resolve } from 'node:path';
import type {
  CrudMemoryStore,
  MemoryEntry,
  MemoryScope,
  MemorySearchOptions,
} from '../../contracts/memory';

export interface FileMemoryStoreOptions {
  /** Must be supplied explicitly; this adapter never chooses a storage location. */
  readonly rootDir: string;
  readonly maxEntriesPerScope?: number;
  readonly maxScopes?: number;
  readonly maxScopeIdChars?: number;
  readonly maxKeyChars?: number;
  readonly maxValueChars?: number;
  readonly maxSearchQueryChars?: number;
  readonly maxSearchResults?: number;
  readonly maxFileBytes?: number;
  readonly maxTtlMs?: number;
  readonly defaultTtlMs?: number;
  readonly now?: () => number;
}

/**
 * Atomic, single-process file-backed memory. It is intentionally opt-in and
 * scope-local; it does not provide encryption, cross-process locking, or RAG.
 */
export class FileMemoryStore implements CrudMemoryStore {
  private readonly rootDir: string;
  private readonly maxEntriesPerScope: number;
  private readonly maxScopes: number;
  private readonly maxScopeIdChars: number;
  private readonly maxKeyChars: number;
  private readonly maxValueChars: number;
  private readonly maxSearchQueryChars: number;
  private readonly maxSearchResults: number;
  private readonly maxFileBytes: number;
  private readonly maxTtlMs: number;
  private readonly defaultTtlMs: number;
  private readonly now: () => number;
  private queue: Promise<void> = Promise.resolve();

  constructor(options: FileMemoryStoreOptions) {
    if (!options.rootDir?.trim()) throw new Error('A memory root directory is required');
    this.rootDir = resolve(options.rootDir);
    this.maxEntriesPerScope = boundedInteger(options.maxEntriesPerScope ?? 100, 1, 5_000);
    this.maxScopes = boundedInteger(options.maxScopes ?? 250, 1, 10_000);
    this.maxScopeIdChars = boundedInteger(options.maxScopeIdChars ?? 128, 1, 1_024);
    this.maxKeyChars = boundedInteger(options.maxKeyChars ?? 128, 1, 1_024);
    this.maxValueChars = boundedInteger(options.maxValueChars ?? 4_000, 1, 100_000);
    this.maxSearchQueryChars = boundedInteger(options.maxSearchQueryChars ?? 200, 1, 1_000);
    this.maxSearchResults = boundedInteger(options.maxSearchResults ?? 50, 1, 1_000);
    this.maxFileBytes = boundedInteger(options.maxFileBytes ?? 1_000_000, 1, 10_000_000);
    this.maxTtlMs = boundedInteger(options.maxTtlMs ?? 365 * 24 * 60 * 60 * 1000, 1, 365 * 24 * 60 * 60 * 1000);
    this.defaultTtlMs = boundedInteger(options.defaultTtlMs ?? 30 * 60 * 1000, 1, this.maxTtlMs);
    this.now = options.now ?? Date.now;
  }

  async read(scope: MemoryScope, key: string): Promise<MemoryEntry | undefined> {
    return this.serialize(async () => {
      this.validateKey(key);
      const { filePath, scopeKey } = this.getScopeFile(scope);
      const entries = await this.readEntries(filePath);
      const entry = entries.find((item) => item.key === key);
      await this.persist(filePath, scopeKey, entries);
      return entry ? { ...entry } : undefined;
    });
  }

  /** Upsert for compatibility with the MemoryStore contract. */
  async write(scope: MemoryScope, entry: MemoryEntry): Promise<void> {
    await this.serialize(async () => {
      const { filePath, scopeKey } = this.getScopeFile(scope);
      const entries = await this.readEntries(filePath);
      const normalized = this.normalizeNewEntry(entry);
      const index = entries.findIndex((item) => item.key === normalized.key);
      if (index < 0 && entries.length >= this.maxEntriesPerScope) {
        throw new Error('Memory scope entry limit reached');
      }
      if (index < 0) entries.push(normalized);
      else entries[index] = normalized;
      await this.persist(filePath, scopeKey, entries);
    });
  }

  async create(scope: MemoryScope, entry: MemoryEntry): Promise<void> {
    await this.serialize(async () => {
      const { filePath, scopeKey } = this.getScopeFile(scope);
      const entries = await this.readEntries(filePath);
      const normalized = this.normalizeNewEntry(entry);
      if (entries.some((item) => item.key === normalized.key)) {
        throw new Error('Memory entry already exists');
      }
      if (entries.length >= this.maxEntriesPerScope) {
        throw new Error('Memory scope entry limit reached');
      }
      entries.push(normalized);
      await this.persist(filePath, scopeKey, entries);
    });
  }

  async update(
    scope: MemoryScope,
    key: string,
    changes: Partial<Pick<MemoryEntry, 'value' | 'expiresAt'>>
  ): Promise<MemoryEntry | undefined> {
    return this.serialize(async () => {
      this.validateKey(key);
      if (!isRecord(changes)
        || Object.keys(changes).some((field) => field !== 'value' && field !== 'expiresAt')) {
        throw new Error('Invalid memory update');
      }
      const { filePath, scopeKey } = this.getScopeFile(scope);
      const entries = await this.readEntries(filePath);
      const index = entries.findIndex((item) => item.key === key);
      if (index < 0) {
        await this.persist(filePath, scopeKey, entries);
        return undefined;
      }
      const updated = this.normalizeNewEntry({ ...entries[index], ...changes, key });
      entries[index] = updated;
      await this.persist(filePath, scopeKey, entries);
      return { ...updated };
    });
  }

  async delete(scope: MemoryScope, key: string): Promise<boolean> {
    return this.serialize(async () => {
      this.validateKey(key);
      const { filePath, scopeKey } = this.getScopeFile(scope);
      const entries = await this.readEntries(filePath);
      const remaining = entries.filter((entry) => entry.key !== key);
      await this.persist(filePath, scopeKey, remaining);
      return remaining.length !== entries.length;
    });
  }

  async list(scope: MemoryScope): Promise<readonly MemoryEntry[]> {
    return this.serialize(async () => {
      const { filePath, scopeKey } = this.getScopeFile(scope);
      const entries = await this.readEntries(filePath);
      await this.persist(filePath, scopeKey, entries);
      return entries.map((entry) => ({ ...entry }));
    });
  }

  async search(
    scope: MemoryScope,
    options: MemorySearchOptions
  ): Promise<readonly MemoryEntry[]> {
    return this.serialize(async () => {
      const query = options?.query;
      const limit = options?.limit;
      if (typeof query !== 'string' || query.length === 0 || query.length > this.maxSearchQueryChars
        || !Number.isInteger(limit) || limit < 1 || limit > this.maxSearchResults) {
        throw new Error('Invalid memory search request');
      }
      const { filePath, scopeKey } = this.getScopeFile(scope);
      const entries = await this.readEntries(filePath);
      await this.persist(filePath, scopeKey, entries);
      const normalizedQuery = query.toLocaleLowerCase();
      return entries
        .filter((entry) => entry.key.toLocaleLowerCase().includes(normalizedQuery)
          || entry.value.toLocaleLowerCase().includes(normalizedQuery))
        .slice(0, limit)
        .map((entry) => ({ ...entry }));
    });
  }

  async clear(scope: MemoryScope): Promise<void> {
    await this.serialize(async () => {
      const { filePath } = this.getScopeFile(scope);
      await this.ensureRoot();
      await unlink(filePath).catch((error: unknown) => {
        if (!isNodeError(error) || error.code !== 'ENOENT') throw error;
      });
    });
  }

  private serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation, operation);
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }

  private getScopeFile(scope: MemoryScope): { filePath: string; scopeKey: string } {
    if (!isRecord(scope)
      || (scope.kind !== 'scenario' && scope.kind !== 'run' && scope.kind !== 'project')
      || typeof scope.id !== 'string'
      || scope.id.length === 0
      || scope.id.length > this.maxScopeIdChars) {
      throw new Error('Invalid memory scope');
    }
    const scopeKey = `${scope.kind}\u0000${scope.id}`;
    const digest = createHash('sha256').update(scopeKey).digest('hex');
    return {
      scopeKey: `${scope.kind}-${digest}`,
      filePath: join(this.rootDir, `${scope.kind}-${digest}.json`),
    };
  }

  private async readEntries(filePath: string): Promise<MemoryEntry[]> {
    await this.ensureRoot();
    let handle;
    try {
      handle = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') return [];
      throw new Error('Unable to read memory scope');
    }
    try {
      const metadata = await handle.stat();
      if (!metadata.isFile() || metadata.size > this.maxFileBytes) throw new Error('Invalid memory file');
      const data = await handle.readFile('utf8');
      const parsed: unknown = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length > this.maxEntriesPerScope) {
        throw new Error('Invalid memory file');
      }
      const seen = new Set<string>();
      const entries = parsed.map((item) => {
        if (!isRecord(item)
          || typeof item.key !== 'string'
          || typeof item.value !== 'string'
          || typeof item.expiresAt !== 'number'
          || !Number.isFinite(item.expiresAt)) {
          throw new Error('Invalid memory file');
        }
        const entry = this.normalizeEntry(item as unknown as MemoryEntry);
        if (seen.has(entry.key)) throw new Error('Invalid memory file');
        seen.add(entry.key);
        return entry;
      });
      return entries.filter((entry) => entry.expiresAt === undefined || entry.expiresAt > this.now());
    } catch {
      throw new Error('Unable to read memory scope');
    } finally {
      await handle.close();
    }
  }

  private normalizeEntry(entry: MemoryEntry): MemoryEntry {
    if (!isRecord(entry)
      || typeof entry.key !== 'string'
      || typeof entry.value !== 'string'
      || (entry.expiresAt !== undefined
        && (typeof entry.expiresAt !== 'number'
          || !Number.isFinite(entry.expiresAt)
          || entry.expiresAt - this.now() > this.maxTtlMs))) {
      throw new Error('Invalid memory entry');
    }
    this.validateKey(entry.key);
    if (entry.value.length > this.maxValueChars) throw new Error('Memory value exceeds configured limit');
    return {
      key: entry.key,
      value: entry.value,
      ...(entry.expiresAt === undefined ? {} : { expiresAt: entry.expiresAt }),
    };
  }

  private normalizeNewEntry(entry: MemoryEntry): MemoryEntry {
    const normalized = this.normalizeEntry(entry);
    return normalized.expiresAt === undefined
      ? { ...normalized, expiresAt: this.now() + this.defaultTtlMs }
      : normalized;
  }

  private validateKey(key: string): void {
    if (typeof key !== 'string' || key.length === 0 || key.length > this.maxKeyChars) {
      throw new Error('Invalid memory key');
    }
  }

  private async persist(
    filePath: string,
    scopeKey: string,
    entries: readonly MemoryEntry[]
  ): Promise<void> {
    await this.ensureRoot();
    if (entries.length === 0) {
      await unlink(filePath).catch((error: unknown) => {
        if (!isNodeError(error) || error.code !== 'ENOENT') throw error;
      });
      return;
    }

    if (!(await this.fileExists(filePath)) && await this.countScopeFiles() >= this.maxScopes) {
      throw new Error('Memory scope limit reached');
    }
    const serialized = JSON.stringify(entries);
    if (Buffer.byteLength(serialized, 'utf8') > this.maxFileBytes) {
      throw new Error('Memory scope exceeds configured storage limit');
    }
    const temporaryPath = join(this.rootDir, `.${scopeKey}.${randomUUID()}.tmp`);
    const handle = await open(temporaryPath, 'wx', 0o600);
    try {
      await handle.writeFile(serialized, 'utf8');
      await handle.sync();
    } catch (error) {
      await handle.close();
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }
    await handle.close();
    try {
      await rename(temporaryPath, filePath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const metadata = await lstat(filePath);
      if (metadata.isSymbolicLink() || !metadata.isFile()) {
        throw new Error('Invalid memory file');
      }
      return true;
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') return false;
      throw error;
    }
  }

  private async countScopeFiles(): Promise<number> {
    const files = await readdir(this.rootDir);
    return files.filter((name) => /^(scenario|run|project)-[a-f0-9]{64}\.json$/.test(name)).length;
  }

  private async ensureRoot(): Promise<void> {
    await mkdir(this.rootDir, { recursive: true, mode: 0o700 });
    const metadata = await lstat(this.rootDir);
    if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
      throw new Error('Invalid memory root directory');
    }
  }
}

function boundedInteger(value: number, min: number, max: number): number {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error('Memory limits are outside the allowed range');
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
