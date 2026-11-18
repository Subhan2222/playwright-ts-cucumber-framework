import type {
  AgentRuntimeFactory,
  ScenarioAgentRuntime,
} from '../src/agentic/integrations/cucumber/world';
import type { ModelProvider } from '../src/agentic/contracts/provider';
import { OllamaModelProvider } from '../src/agentic/adapters/providers/ollama-model-provider';
import {
  sanitizeObservation,
} from '../src/agentic/integrations/cucumber/lifecycle';
import type { LocatorRecoveryRequest } from '../src/agentic/integrations/cucumber/locator-recovery';

export const createScenarioAgentRuntime = async (
  _scope: Parameters<AgentRuntimeFactory>[0],
  provider: ModelProvider = new OllamaModelProvider()
): Promise<ScenarioAgentRuntime> => {
  return {
    diagnoseFailure: async ({ scenarioName, stepText, errorSummary, signal }) => {
      const response = await provider.complete({
        messages: [
          {
            role: 'system',
            content: 'You review browser test failures. Return only a brief, evidence-based diagnosis and one suggested next check, in at most two short sentences. Do not reveal internal reasoning, repeat the instructions, or claim to have changed or rerun anything.',
          },
          {
            role: 'user',
            content: [
              `Scenario: ${scenarioName}`,
              `Failed step: ${stepText}`,
              `Error: ${errorSummary}`,
            ].join('\n'),
          },
        ],
        maxOutputTokens: 300,
        signal,
      });

      return { status: 'completed', output: response.content };
    },
    suggestLocatorRecovery: async (request, signal) => {
      const candidates = request.candidates.map(({ id, description }) => ({
        id,
        description: sanitizeObservation(description),
      }));
      const response = await provider.complete({
        messages: [
          {
            role: 'system',
            content: 'You select a replacement locator for a failed browser test action. Choose only the single candidate whose description best matches the intended target and action. Never invent or modify a candidate. If no candidate is clearly appropriate or there is ambiguity, return exactly {"candidateId":null}. Otherwise return exactly {"candidateId":"<one provided id>"}. Return JSON only.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              action: request.action,
              failedTarget: sanitizeObservation(request.target),
              candidates,
            }),
          },
        ],
        maxOutputTokens: 100,
        signal,
      });

      return parseCandidateSelection(response.content, request);
    },
    dispose: async () => undefined,
  };
};

function parseCandidateSelection(
  content: string,
  request: LocatorRecoveryRequest
): string | undefined {
  let result: unknown;
  try {
    result = JSON.parse(content.trim());
  } catch {
    return undefined;
  }
  if (typeof result !== 'object' || result === null || !('candidateId' in result)) {
    return undefined;
  }
  const candidateId = result.candidateId;
  return typeof candidateId === 'string'
    && request.candidates.some((candidate) => candidate.id === candidateId)
    ? candidateId
    : undefined;
}
