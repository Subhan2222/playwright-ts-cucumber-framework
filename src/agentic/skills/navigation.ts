import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type NavigationSkillPort = ReadOnlyCapabilityPort;

export function createNavigationSkill(port: NavigationSkillPort) {
  return createReadOnlyCapabilitySkill(
    'navigation.observe',
    'Observe an explicitly approved navigation state without changing the page.',
    port
  );
}
