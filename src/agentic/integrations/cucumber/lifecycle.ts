import type { AgentResponse } from '../../contracts/agent';
import type {
  AgentRuntimeFactory,
  CucumberWorld,
  FailureObservation,
} from './world';

const MAX_OBSERVATION_CHARS = 500;
const DIAGNOSTIC_TIMEOUT_MS = 3000;

export async function initializeScenarioRuntime(
  world: CucumberWorld,
  enabled: boolean,
  factory?: AgentRuntimeFactory
): Promise<void> {
  if (!enabled) return;
  if (!factory) {
    throw new Error(
      'Agentic tests are enabled but no runtime factory is configured; provide an explicit provider/runtime adapter.'
    );
  }
  world.agentRuntime = await factory({
    scenarioId: world.scenarioId,
    scenarioName: world.scenarioName,
  });
}

export async function disposeScenarioRuntime(world: CucumberWorld): Promise<void> {
  const runtime = world.agentRuntime;
  world.agentRuntime = undefined;
  if (runtime) await runtime.dispose();
}

export async function diagnoseFailureSafely(
  world: CucumberWorld,
  observation: FailureObservation
): Promise<AgentResponse | undefined> {
  if (!world.agentRuntime || world.agentDiagnosticInvoked) return undefined;
  world.agentDiagnosticInvoked = true;
  const sanitized: FailureObservation = {
    scenarioName: sanitizeObservation(observation.scenarioName),
    stepText: sanitizeObservation(observation.stepText),
    errorSummary: sanitizeObservation(observation.errorSummary),
  };

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      world.agentRuntime.diagnoseFailure({ ...sanitized, signal: controller.signal }),
      new Promise<undefined>((resolve) => {
        timer = setTimeout(() => {
          controller.abort();
          resolve(undefined);
        }, DIAGNOSTIC_TIMEOUT_MS);
      }),
    ]);
    if (!result) return undefined;
    return {
      ...result,
      message: result.message ? sanitizeObservation(result.message) : undefined,
      output: typeof result.output === 'string'
        ? sanitizeObservation(result.output)
        : undefined,
    };
  } catch {
    // Diagnostics are supplementary and must never fail or change the test result.
    return undefined;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function sanitizeObservation(value: string): string {
  return value
    .replace(/\b(password|secret|token|authorization|api[_-]?key)\b\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1=[REDACTED]')
    .replace(/\bBearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/([?&][^=&#\s]+)=([^&#\s]+)/g, '$1=[REDACTED]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]')
    .slice(0, MAX_OBSERVATION_CHARS);
}
