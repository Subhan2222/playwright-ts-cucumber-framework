import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type LocatorSkillPort = ReadOnlyCapabilityPort;

export function createLocatorSkill(port: LocatorSkillPort) {
  return createReadOnlyCapabilitySkill(
    'locator.suggest-recovery',
    'Suggest a locator recovery hypothesis for human review; never changes selectors.',
    port
  );
}
