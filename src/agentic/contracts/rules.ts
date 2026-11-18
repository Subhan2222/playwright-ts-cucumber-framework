import type { SkillSideEffect } from './skill';

export interface AgentPolicy {
  readonly enabled: boolean;
  readonly allowedAgentIds: readonly string[];
  readonly allowedSkillIds: readonly string[];
  readonly allowedSideEffects: readonly SkillSideEffect[];
  readonly maxCallsPerRun: number;
  readonly timeoutMs: number;
  readonly maxInputChars: number;
}

export interface PolicyDecision {
  readonly allowed: boolean;
  readonly reason?: string;
}
