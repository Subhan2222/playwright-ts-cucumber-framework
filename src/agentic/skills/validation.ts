import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type ValidationSkillPort = ReadOnlyCapabilityPort;

export function createValidationSkill(port: ValidationSkillPort) {
  return createReadOnlyCapabilitySkill(
    'validation.observe',
    'Run an approved read-only validation observation.',
    port
  );
}
