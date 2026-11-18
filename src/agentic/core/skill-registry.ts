import type { Agent } from '../contracts/agent';
import type { SkillDefinition } from '../contracts/skill';

export class SkillRegistry {
  private readonly skills = new Map<string, SkillDefinition<unknown, unknown>>();

  register<Input, Output>(skill: SkillDefinition<Input, Output>): void {
    if (this.skills.has(skill.id)) {
      throw new Error(`Skill already registered: ${skill.id}`);
    }
    this.skills.set(skill.id, skill as SkillDefinition<unknown, unknown>);
  }

  get(id: string): SkillDefinition<unknown, unknown> | undefined {
    return this.skills.get(id);
  }
}

export class AgentRegistry {
  private readonly agents = new Map<string, Agent>();

  register(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent already registered: ${agent.id}`);
    }
    this.agents.set(agent.id, agent);
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }
}
