import type { AgentRunContext } from './orchestration';

export type SkillSideEffect = 'read' | 'write' | 'external';

export interface SkillDefinition<Input, Output> {
  readonly id: string;
  readonly version: string;
  readonly description: string;
  readonly sideEffects: readonly SkillSideEffect[];
  readonly validateInput: (value: unknown) => value is Input;
  readonly validateOutput: (value: unknown) => value is Output;
  readonly execute: (input: Input, context: AgentRunContext) => Promise<Output>;
}
