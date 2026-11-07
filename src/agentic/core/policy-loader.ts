import type { AgentPolicy } from '../contracts/rules';
import type { SkillSideEffect } from '../contracts/skill';

const effects = new Set<SkillSideEffect>(['read', 'write', 'external']);
const identifier = /^[a-z][a-z0-9._-]{0,63}$/;

/** Parse untrusted JSON/configuration into a bounded policy; malformed data fails closed. */
export function parseAgentPolicy(value: unknown): AgentPolicy {
  if (!isRecord(value)) throw new Error('Invalid agent policy');
  const allowedAgentIds = readIdentifiers(value.allowedAgentIds);
  const allowedSkillIds = readIdentifiers(value.allowedSkillIds);
  if (!Array.isArray(value.allowedSideEffects)
    || value.allowedSideEffects.length > 3
    || value.allowedSideEffects.some((effect) => typeof effect !== 'string' || !effects.has(effect as SkillSideEffect))) {
    throw new Error('Invalid agent policy');
  }

  return {
    enabled: readBoolean(value.enabled),
    allowedAgentIds,
    allowedSkillIds,
    allowedSideEffects: [...new Set(value.allowedSideEffects as SkillSideEffect[])],
    maxCallsPerRun: readInteger(value.maxCallsPerRun, 1, 100),
    timeoutMs: readInteger(value.timeoutMs, 1, 60_000),
    maxInputChars: readInteger(value.maxInputChars, 1, 10_000),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new Error('Invalid agent policy');
  return value;
}

function readInteger(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new Error('Invalid agent policy');
  }
  return value;
}

function readIdentifiers(value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Invalid agent policy');
  if (value.some((item) => typeof item !== 'string' || !identifier.test(item))) {
    throw new Error('Invalid agent policy');
  }
  const identifiers = value as string[];
  if (new Set(identifiers).size !== identifiers.length) throw new Error('Invalid agent policy');
  return [...identifiers];
}
