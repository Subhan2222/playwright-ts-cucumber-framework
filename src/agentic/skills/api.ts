import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type ApiSkillPort = ReadOnlyCapabilityPort;

export function createApiSkill(port: ApiSkillPort) {
  return createReadOnlyCapabilitySkill(
    'api.inspect',
    'Inspect an explicitly allowlisted API observation; does not issue arbitrary requests or mutations.',
    port
  );
}
