import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type VisualSkillPort = ReadOnlyCapabilityPort;

export function createVisualSkill(port: VisualSkillPort) {
  return createReadOnlyCapabilitySkill(
    'visual.observe',
    'Observe a supplied visual-analysis result; no screenshot or visual AI adapter is included.',
    port
  );
}
