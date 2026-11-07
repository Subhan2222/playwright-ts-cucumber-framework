import type { AgentRunContext } from './orchestration';
import type { ModelProvider } from './provider';

export interface AgentRequest {
  readonly agentId: string;
  readonly task: string;
  readonly context: AgentRunContext;
}

export interface AgentPlan {
  readonly skillId: string;
  readonly input: unknown;
}

/**
 * An agent can propose a registered skill only. The orchestrator authorizes and
 * executes that skill; agent output never controls Cucumber pass/fail.
 */
export interface Agent {
  readonly id: string;
  plan(request: AgentRequest, provider?: ModelProvider): Promise<AgentPlan>;
}

export interface AgentResponse {
  readonly status: 'completed' | 'denied' | 'failed';
  readonly skillId?: string;
  readonly output?: unknown;
  readonly message?: string;
}
