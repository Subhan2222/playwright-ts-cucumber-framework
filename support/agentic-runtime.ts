import type { AgentRuntimeFactory } from '../src/agentic/integrations/cucumber/world';

/**
 * Explicit integration seam. Replace this function with a runtime that injects
 * an approved provider, skills, rules, stores, and sinks before enabling the
 * AGENTIC_TESTS_ENABLED flag. No provider is selected by this repository.
 */
export const createScenarioAgentRuntime: AgentRuntimeFactory = async () => {
  throw new Error(
    'No agentic runtime adapter is configured. Implement support/agentic-runtime.ts before setting AGENTIC_TESTS_ENABLED=true.'
  );
};
