import type { IWorld } from '@cucumber/cucumber';
import type { BrowserContext, Page } from 'playwright';
import type POManager from '../../../pages/POManager';
import type { AgentResponse } from '../../contracts/agent';
import type { PomCapability } from '../../contracts/pom-capability';

export interface FailureObservation {
  readonly scenarioName: string;
  readonly stepText: string;
  readonly errorSummary: string;
  readonly signal?: AbortSignal;
}

export interface ScenarioAgentRuntime {
  diagnoseFailure(observation: FailureObservation): Promise<AgentResponse>;
  dispose(): Promise<void>;
}

export interface AgentRuntimeFactory {
  (scope: {
    readonly scenarioId?: string;
    readonly scenarioName?: string;
    /** Present only after explicit, separate POM capability opt-in. */
    readonly pomCapability?: PomCapability;
  }): Promise<ScenarioAgentRuntime>;
}

/** Cucumber World extension; runtime and browser resources belong to one scenario. */
export interface CucumberWorld extends IWorld {
  context?: BrowserContext;
  page?: Page;
  pageManager?: POManager;
  scenarioId?: string;
  scenarioName?: string;
  agentRuntime?: ScenarioAgentRuntime;
  agentDiagnosticInvoked?: boolean;
}
