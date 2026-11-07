import prompts from '../config/agent-prompts.json';
import type { Agent, AgentPlan, AgentRequest } from '../contracts/agent';
import type { ModelProvider } from '../contracts/provider';
import { AgentRegistry } from '../core/skill-registry';

type PromptId = keyof typeof prompts;

abstract class PromptedAgent implements Agent {
  abstract readonly id: string;
  protected abstract readonly promptId: PromptId;
  protected abstract readonly skillId: string;

  async plan(request: AgentRequest, provider?: ModelProvider): Promise<AgentPlan> {
    const prompt = prompts[this.promptId];
    let taskInput = request.task;
    if (provider) {
      const response = await provider.complete({
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: request.task },
        ],
        maxOutputTokens: prompt.maxOutputTokens,
        signal: request.context.signal,
      });
      taskInput = response.content.trim().slice(0, 2_000);
    }

    return {
      skillId: this.skillId,
      input: { request: taskInput },
    };
  }
}

/** Uses the fixed analysis.plan skill; cannot select tools or alter its binding. */
export class PlannerAgent extends PromptedAgent {
  readonly id = 'planner';
  protected readonly promptId = 'planner';
  protected readonly skillId = 'analysis.plan';
}

/** Routes only to a registered read-only validation skill. */
export class ExecutorAgent extends PromptedAgent {
  readonly id = 'executor';
  protected readonly promptId = 'executor';
  protected readonly skillId = 'validation.observe';
}

/** Routes only to a registered read-only observation skill. */
export class ObserverAgent extends PromptedAgent {
  readonly id = 'observer';
  protected readonly promptId = 'observer';
  protected readonly skillId = 'visual.observe';
}

/** Produces a review-only locator hypothesis; it does not heal or mutate selectors. */
export class HealingAgent extends PromptedAgent {
  readonly id = 'healing';
  protected readonly promptId = 'healing';
  protected readonly skillId = 'locator.suggest-recovery';
}

/** Routes supplied evidence to the fixed analysis.review skill. */
export class AnalysisAgent extends PromptedAgent {
  readonly id = 'analysis';
  protected readonly promptId = 'analysis';
  protected readonly skillId = 'analysis.review';
}

/** Produces a proposed test draft through a fixed review-only skill. */
export class TestGenerationAgent extends PromptedAgent {
  readonly id = 'test-generation';
  protected readonly promptId = 'testGeneration';
  protected readonly skillId = 'test-generation.propose';
}

/** Create the named agents explicitly; caller still owns policy and skill registration. */
export function createNamedAgentRegistry(): AgentRegistry {
  const registry = new AgentRegistry();
  registry.register(new PlannerAgent());
  registry.register(new ExecutorAgent());
  registry.register(new ObserverAgent());
  registry.register(new HealingAgent());
  registry.register(new AnalysisAgent());
  registry.register(new TestGenerationAgent());
  return registry;
}
