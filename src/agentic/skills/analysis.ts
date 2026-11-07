import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type AnalysisSkillPort = ReadOnlyCapabilityPort;

export function createAnalysisSkill(port: AnalysisSkillPort) {
  return createReadOnlyCapabilitySkill(
    'analysis.review',
    'Analyze supplied test evidence and separate facts from hypotheses.',
    port
  );
}

export function createPlanningSkill(port: AnalysisSkillPort) {
  return createReadOnlyCapabilitySkill(
    'analysis.plan',
    'Create a read-only test-analysis plan from supplied information.',
    port
  );
}
