import type { AgentResponse } from '../../contracts/agent';
import type {
  AgentRuntimeFactory,
  CucumberWorld,
  FailureObservation,
} from './world';
import type { PomCapability } from '../../contracts/pom-capability';

const MAX_OBSERVATION_CHARS = 500;
const DIAGNOSTIC_TIMEOUT_MS = 30_000;

export async function initializeScenarioRuntime(
  world: CucumberWorld,
  enabled: boolean,
  factory?: AgentRuntimeFactory,
  pomCapability?: PomCapability
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
    ...(pomCapability ? { pomCapability } : {}),
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
      new Promise<AgentResponse>((resolve) => {
        timer = setTimeout(() => {
          controller.abort();
          console.warn('[Agentic Diagnostic] Ollama diagnosis timed out.');
          resolve({
            status: 'failed',
            message: 'Ollama diagnosis timed out after 30 seconds.',
          });
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
  } catch (error) {
    // Diagnostics are supplementary and must never fail or change the test result.
    const message = error instanceof Error ? error.message : 'Unknown diagnostic error';
    const safeMessage = sanitizeObservation(message);
    console.warn(`[Agentic Diagnostic] ${safeMessage}`);
    return { status: 'failed', message: safeMessage };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function formatAgentDiagnosticReport(
  observation: FailureObservation,
  result: AgentResponse,
  model = process.env.OLLAMA_MODEL?.trim() || 'qwen3:4b'
): string {
  const diagnosis = typeof result.output === 'string'
    ? sanitizeObservation(result.output)
    : sanitizeObservation(result.message ?? 'No diagnosis was returned.');

  return [
    'AGENTIC FAILURE ANALYSIS',
    'Provider: Ollama',
    `Model: ${sanitizeObservation(model)}`,
    `Status: ${result.status}`,
    `Scenario: ${sanitizeObservation(observation.scenarioName)}`,
    `Failed step: ${sanitizeObservation(observation.stepText)}`,
    `Test failure: ${sanitizeObservation(observation.errorSummary)}`,
    `Diagnosis: ${diagnosis}`,
    'Note: This is advisory only; Cucumber test status is unchanged.',
  ].join('\n');
}

export function sanitizeObservation(value: string): string {
  return value
    .replace(/\b(password|secret|token|authorization|api[_-]?key)\b\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1=[REDACTED]')
    .replace(/\bBearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/([?&][^=&#\s]+)=([^&#\s]+)/g, '$1=[REDACTED]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]')
    .slice(0, MAX_OBSERVATION_CHARS);
}
