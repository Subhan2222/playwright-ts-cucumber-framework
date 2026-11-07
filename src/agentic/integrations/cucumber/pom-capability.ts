import type {
  PomCapability,
  PomCapabilityPolicy,
  PomReadActionKind,
} from '../../contracts/pom-capability';
import {
  createPolicyCheckedPomCapability,
  parsePomActionAllowlist,
} from '../../core/pom-capability';
import type { CucumberWorld } from './world';

/**
 * Bind the narrow read-only capability to the scenario's existing POM. Only
 * fixed POM methods are captured; neither the Page nor POManager is returned.
 */
export function createScenarioPomCapability(
  world: CucumberWorld,
  policy: PomCapabilityPolicy
): PomCapability {
  return createPolicyCheckedPomCapability({
    verifyDashboardMenu: async (menuOption) => {
      const manager = world.pageManager;
      if (!manager) throw new Error('Scenario Page Objects are not available');
      return manager.getDashboardPage().isDashboardMenuVisible(menuOption);
    },
    verifySearchResults: async (searchItem) => {
      const manager = world.pageManager;
      if (!manager) throw new Error('Scenario Page Objects are not available');
      return manager.getDashboardPage().isSearchResultVisible(searchItem);
    },
    verifyMenuHidden: async () => {
      const manager = world.pageManager;
      if (!manager) throw new Error('Scenario Page Objects are not available');
      return manager.getDashboardPage().isMenuHidden();
    },
  }, policy);
}

export function pomPolicyFromEnvironment(
  capabilitiesEnabled: boolean,
  allowedActionsValue: string | undefined
): PomCapabilityPolicy {
  const allowedActions: readonly PomReadActionKind[] = capabilitiesEnabled
    ? parseAllowedActions(allowedActionsValue)
    : [];
  return {
    enabled: capabilitiesEnabled,
    allowedActions,
    maxCalls: 5,
    maxInputChars: 120,
  };
}

function parseAllowedActions(value: string | undefined): readonly PomReadActionKind[] {
  // Keep the environment parsing in this integration layer while sharing the
  // canonical allowlist parser with the core policy implementation.
  return parsePomActionAllowlist(value);
}
