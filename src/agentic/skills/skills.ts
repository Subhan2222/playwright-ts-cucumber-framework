import type { AgentRunContext } from '../contracts/orchestration';
import type { SkillDefinition } from '../contracts/skill';

export interface ReadOnlyCapabilityInput {
  readonly request: string;
}

export interface ReadOnlyCapabilityOutput {
  readonly summary: string;
}

/** Injected implementation is deliberately given only a bounded request and run context. */
export interface ReadOnlyCapabilityPort {
  observe(
    input: ReadOnlyCapabilityInput,
    context: AgentRunContext
  ): Promise<ReadOnlyCapabilityOutput>;
}

export type AccessibilitySkillPort = ReadOnlyCapabilityPort;
export type AnalysisSkillPort = ReadOnlyCapabilityPort;
export type ApiSkillPort = ReadOnlyCapabilityPort;
export type AuthSkillPort = ReadOnlyCapabilityPort;
export type DatabaseSkillPort = ReadOnlyCapabilityPort;
export type FormSkillPort = ReadOnlyCapabilityPort;
export type LocatorSkillPort = ReadOnlyCapabilityPort;
export type NavigationSkillPort = ReadOnlyCapabilityPort;
export type ReportingSkillPort = ReadOnlyCapabilityPort;
export type ValidationSkillPort = ReadOnlyCapabilityPort;
export type VisualSkillPort = ReadOnlyCapabilityPort;

export function createAccessibilitySkill(port: AccessibilitySkillPort) {
  return createReadOnlyCapabilitySkill(
    'accessibility.inspect',
    'Inspect an approved accessibility observation without changing the application.',
    port
  );
}

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

export function createApiSkill(port: ApiSkillPort) {
  return createReadOnlyCapabilitySkill(
    'api.inspect',
    'Inspect an explicitly allowlisted API observation; does not issue arbitrary requests or mutations.',
    port
  );
}

export function createAuthSkill(port: AuthSkillPort) {
  return createReadOnlyCapabilitySkill(
    'auth.inspect',
    'Inspect a non-secret authentication-state summary; never handles credentials or changes auth state.',
    port
  );
}

export function createDatabaseSkill(port: DatabaseSkillPort) {
  return createReadOnlyCapabilitySkill(
    'database.inspect',
    'Inspect an approved database observation; adapters must use read-only queries and fixed permissions.',
    port
  );
}

export function createFormSkill(port: FormSkillPort) {
  return createReadOnlyCapabilitySkill(
    'form.inspect',
    'Inspect an explicitly approved form state without submitting or editing it.',
    port
  );
}

export function createLocatorSkill(port: LocatorSkillPort) {
  return createReadOnlyCapabilitySkill(
    'locator.suggest-recovery',
    'Suggest a locator recovery hypothesis for human review; never changes selectors.',
    port
  );
}

export function createNavigationSkill(port: NavigationSkillPort) {
  return createReadOnlyCapabilitySkill(
    'navigation.observe',
    'Observe an explicitly approved navigation state without changing the page.',
    port
  );
}

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

export function createValidationSkill(port: ValidationSkillPort) {
  return createReadOnlyCapabilitySkill(
    'validation.observe',
    'Run an approved read-only validation observation.',
    port
  );
}

export function createVisualSkill(port: VisualSkillPort) {
  return createReadOnlyCapabilitySkill(
    'visual.observe',
    'Observe a supplied visual-analysis result; no screenshot or visual AI adapter is included.',
    port
  );
}

function createReadOnlyCapabilitySkill(
  id: string,
  description: string,
  port: ReadOnlyCapabilityPort
): SkillDefinition<ReadOnlyCapabilityInput, ReadOnlyCapabilityOutput> {
  return {
    id,
    version: '1',
    description,
    sideEffects: ['read'],
    validateInput: (value): value is ReadOnlyCapabilityInput =>
      isRecord(value)
      && typeof value.request === 'string'
      && value.request.length > 0
      && value.request.length <= 2_000,
    validateOutput: (value): value is ReadOnlyCapabilityOutput =>
      isRecord(value)
      && typeof value.summary === 'string'
      && value.summary.length <= 4_000,
    execute: (input, context) => port.observe(input, context),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
