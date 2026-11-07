import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type AccessibilitySkillPort = ReadOnlyCapabilityPort;

export function createAccessibilitySkill(port: AccessibilitySkillPort) {
  return createReadOnlyCapabilitySkill(
    'accessibility.inspect',
    'Inspect an approved accessibility observation without changing the application.',
    port
  );
}
