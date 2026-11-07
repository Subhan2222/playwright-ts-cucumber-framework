import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type AuthSkillPort = ReadOnlyCapabilityPort;

export function createAuthSkill(port: AuthSkillPort) {
  return createReadOnlyCapabilitySkill(
    'auth.inspect',
    'Inspect a non-secret authentication-state summary; never handles credentials or changes auth state.',
    port
  );
}
