import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type DatabaseSkillPort = ReadOnlyCapabilityPort;

export function createDatabaseSkill(port: DatabaseSkillPort) {
  return createReadOnlyCapabilitySkill(
    'database.inspect',
    'Inspect an approved database observation; adapters must use read-only queries and fixed permissions.',
    port
  );
}
