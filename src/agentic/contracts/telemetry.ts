export interface AgentTelemetryEvent {
  readonly name: 'agent.started' | 'agent.completed' | 'agent.denied' | 'agent.failed';
  readonly timestamp: string;
  readonly runId: string;
  readonly scenarioId?: string;
  readonly agentId: string;
  readonly skillId?: string;
  readonly durationMs?: number;
}

export interface TelemetrySink {
  emit(event: AgentTelemetryEvent): Promise<void>;
}
