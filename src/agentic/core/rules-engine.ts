import type { AgentPolicy, PolicyDecision } from '../contracts/rules';
import type { SkillDefinition } from '../contracts/skill';

export class RulesEngine {
  constructor(private readonly policy: AgentPolicy) {}

  authorizeAgent(agentId: string): PolicyDecision {
    if (!this.policy.enabled) return { allowed: false, reason: 'Agentic execution is disabled' };
    if (!this.policy.allowedAgentIds.includes(agentId)) {
      return { allowed: false, reason: `Agent is not allowlisted: ${agentId}` };
    }
    return { allowed: true };
  }

  authorizeSkill<Input, Output>(skill: SkillDefinition<Input, Output>): PolicyDecision {
    if (!this.policy.enabled) return { allowed: false, reason: 'Agentic execution is disabled' };
    if (!this.policy.allowedSkillIds.includes(skill.id)) {
      return { allowed: false, reason: `Skill is not allowlisted: ${skill.id}` };
    }
    const disallowedEffect = skill.sideEffects.find(
      (effect) => !this.policy.allowedSideEffects.includes(effect)
    );
    if (disallowedEffect) {
      return { allowed: false, reason: `Skill side effect is not allowed: ${disallowedEffect}` };
    }
    return { allowed: true };
  }

  get limits(): Pick<AgentPolicy, 'maxCallsPerRun' | 'timeoutMs' | 'maxInputChars'> {
    return {
      maxCallsPerRun: this.policy.maxCallsPerRun,
      timeoutMs: this.policy.timeoutMs,
      maxInputChars: this.policy.maxInputChars,
    };
  }
}
