import type { AgentRequest, AgentResponse } from '../contracts/agent';
import type { AgentRunContext } from '../contracts/orchestration';
import type { ModelProvider } from '../contracts/provider';
import type { TelemetrySink } from '../contracts/telemetry';
import { AgentRegistry, SkillRegistry } from './skill-registry';
import { RulesEngine } from './rules-engine';

export interface OrchestratorDependencies {
  readonly agents: AgentRegistry;
  readonly skills: SkillRegistry;
  readonly rules: RulesEngine;
  readonly telemetry: TelemetrySink;
  readonly provider?: ModelProvider;
  readonly now?: () => number;
}

export class AgentOrchestrator {
  private readonly callsByRun = new Map<string, number>();
  private readonly now: () => number;

  constructor(private readonly dependencies: OrchestratorDependencies) {
    this.now = dependencies.now ?? Date.now;
  }

  /** Clear scenario/run accounting when the owning runtime is disposed. */
  resetRun(runId: string): void {
    this.callsByRun.delete(runId);
  }

  async run(request: AgentRequest): Promise<AgentResponse> {
    const startedAt = this.now();
    const { agentId, task, context } = request;
    const denied = (message: string): AgentResponse => ({ status: 'denied', message });
    const agentDecision = this.dependencies.rules.authorizeAgent(agentId);
    if (!agentDecision.allowed) {
      await this.emit('agent.denied', context, agentId, undefined, startedAt);
      return denied(agentDecision.reason ?? 'Agent denied');
    }
    if (task.length > this.dependencies.rules.limits.maxInputChars) {
      await this.emit('agent.denied', context, agentId, undefined, startedAt);
      return denied('Task exceeds the configured input limit');
    }

    const agent = this.dependencies.agents.get(agentId);
    if (!agent) return denied(`Unknown agent: ${agentId}`);
    const usedCalls = this.callsByRun.get(context.runId) ?? 0;
    if (usedCalls >= this.dependencies.rules.limits.maxCallsPerRun) {
      return denied('Run call budget exhausted');
    }
    this.callsByRun.set(context.runId, usedCalls + 1);
    await this.emit('agent.started', context, agentId, undefined, startedAt);

    const controller = new AbortController();
    const propagateAbort = (): void => controller.abort();
    if (context.signal?.aborted) controller.abort();
    else context.signal?.addEventListener('abort', propagateAbort, { once: true });
    const timeoutAt = this.now() + this.dependencies.rules.limits.timeoutMs;
    const executionContext: AgentRunContext = {
      ...context,
      signal: controller.signal,
      deadlineAt: context.deadlineAt === undefined
        ? timeoutAt
        : Math.min(context.deadlineAt, timeoutAt),
    };

    try {
      const plan = await this.withTimeout(
        () => agent.plan({ ...request, context: executionContext }, this.dependencies.provider),
        executionContext,
        () => controller.abort()
      );
      const skill = this.dependencies.skills.get(plan.skillId);
      if (!skill) return denied(`Unknown skill: ${plan.skillId}`);
      const decision = this.dependencies.rules.authorizeSkill(skill);
      if (!decision.allowed) return denied(decision.reason ?? 'Skill denied');
      if (this.measureInput(plan.input) > this.dependencies.rules.limits.maxInputChars) {
        return denied('Skill input exceeds the configured input limit');
      }
      if (!skill.validateInput(plan.input)) return { status: 'failed', skillId: skill.id, message: 'Skill input validation failed' };

      const output = await this.withTimeout(
        () => skill.execute(plan.input, executionContext),
        executionContext,
        () => controller.abort()
      );
      if (!skill.validateOutput(output)) {
        return { status: 'failed', skillId: skill.id, message: 'Skill output validation failed' };
      }
      if (this.measureInput(output) > this.dependencies.rules.limits.maxInputChars) {
        return { status: 'failed', skillId: skill.id, message: 'Skill output exceeds the configured size limit' };
      }
      await this.emit('agent.completed', context, agentId, skill.id, startedAt);
      return { status: 'completed', skillId: skill.id, output };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Agent execution failed';
      await this.emit('agent.failed', context, agentId, undefined, startedAt);
      return { status: 'failed', message };
    } finally {
      context.signal?.removeEventListener('abort', propagateAbort);
    }
  }

  private async withTimeout<T>(
    work: () => Promise<T>,
    context: AgentRunContext,
    cancel: () => void
  ): Promise<T> {
    const { timeoutMs } = this.dependencies.rules.limits;
    const remaining = context.deadlineAt === undefined
      ? timeoutMs
      : Math.min(timeoutMs, context.deadlineAt - this.now());
    if (remaining <= 0) throw new Error('Agent execution deadline exceeded');
    if (context.signal?.aborted) throw new Error('Agent execution cancelled');

    let timer: ReturnType<typeof setTimeout> | undefined;
    let onAbort: (() => void) | undefined;
    try {
      return await Promise.race([
        work(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(new Error('Agent execution timed out'));
            cancel();
          }, remaining);
        }),
        ...(context.signal
          ? [new Promise<never>((_, reject) => {
              onAbort = () => reject(new Error('Agent execution cancelled'));
              context.signal?.addEventListener('abort', onAbort, { once: true });
            })]
          : []),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
      if (onAbort) context.signal?.removeEventListener('abort', onAbort);
    }
  }

  private measureInput(input: unknown): number {
    try {
      return JSON.stringify(input)?.length ?? Number.POSITIVE_INFINITY;
    } catch {
      return Number.POSITIVE_INFINITY;
    }
  }

  private async emit(
    name: 'agent.started' | 'agent.completed' | 'agent.denied' | 'agent.failed',
    context: AgentRunContext,
    agentId: string,
    skillId: string | undefined,
    startedAt: number
  ): Promise<void> {
    try {
      await this.dependencies.telemetry.emit({
        name,
        timestamp: new Date(this.now()).toISOString(),
        runId: context.runId,
        scenarioId: context.scenarioId,
        agentId,
        skillId,
        durationMs: Math.max(0, this.now() - startedAt),
      });
    } catch {
      // Telemetry is best-effort and must not affect test execution.
    }
  }
}
