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

export function createReadOnlyCapabilitySkill(
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
