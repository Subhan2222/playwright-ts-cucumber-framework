export interface AgentRunContext {
  readonly runId: string;
  readonly scenarioId?: string;
  readonly signal?: AbortSignal;
  readonly deadlineAt?: number;
}

export interface OrchestrationBudget {
  readonly timeoutMs: number;
  readonly maxCalls: number;
}
