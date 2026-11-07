import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type ReportingSkillPort = ReadOnlyCapabilityPort;

export function createReportingSkill(port: ReportingSkillPort) {
  return createReadOnlyCapabilitySkill(
    'reporting.summarize',
    'Summarize supplied test evidence without changing the result.',
    port
  );
}

export function createTestGenerationSkill(port: ReportingSkillPort) {
  return createReadOnlyCapabilitySkill(
    'test-generation.propose',
    'Draft a proposed test for review; does not execute tests or change files.',
    port
  );
}
