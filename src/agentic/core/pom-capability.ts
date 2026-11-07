import type {
  PomCapability,
  PomCapabilityPolicy,
  PomCapabilityResult,
  PomReadAction,
  PomReadActionKind,
  PomReadExecutor,
} from '../contracts/pom-capability';

const ACTION_KINDS: readonly PomReadActionKind[] = [
  'dashboard.verify-menu',
  'dashboard.verify-search-results',
  'dashboard.verify-menu-hidden',
];

/**
 * Wraps trusted, framework-owned POM callbacks with a default-deny allowlist
 * and per-scenario call/input limits. The returned object exposes only invoke().
 */
export function createPolicyCheckedPomCapability(
  executor: PomReadExecutor,
  policy: PomCapabilityPolicy
): PomCapability {
  if (!Number.isSafeInteger(policy.maxCalls) || policy.maxCalls < 0) {
    throw new Error('POM capability maxCalls must be a non-negative integer');
  }
  if (!Number.isSafeInteger(policy.maxInputChars) || policy.maxInputChars < 0) {
    throw new Error('POM capability maxInputChars must be a non-negative integer');
  }

  const allowedActions = new Set(policy.allowedActions);
  if ([...allowedActions].some((action) => !ACTION_KINDS.includes(action))) {
    throw new Error('POM capability policy contains an unknown action');
  }

  let calls = 0;
  const denied = (
    message: string,
    action?: PomReadActionKind
  ): PomCapabilityResult => ({ status: 'denied', action, message });

  return Object.freeze({
    async invoke(action: PomReadAction): Promise<PomCapabilityResult> {
      if (!policy.enabled) return denied('POM capability is disabled');
      if (!isPomReadAction(action)) return denied('POM action is invalid');
      if (!allowedActions.has(action.kind)) {
        return denied('POM action is not allowlisted', action.kind);
      }

      const input = actionInput(action);
      if (input.length > policy.maxInputChars) {
        return denied('POM action input exceeds the configured limit', action.kind);
      }
      if (calls >= policy.maxCalls) {
        return denied('POM capability call budget exhausted', action.kind);
      }
      // Increment synchronously before dispatch so concurrent calls cannot
      // race past the per-scenario limit.
      calls += 1;

      try {
        let observed: boolean;
        switch (action.kind) {
          case 'dashboard.verify-menu':
            observed = await executor.verifyDashboardMenu(action.menuOption);
            break;
          case 'dashboard.verify-search-results':
            observed = await executor.verifySearchResults(action.searchItem);
            break;
          case 'dashboard.verify-menu-hidden':
            observed = await executor.verifyMenuHidden();
            break;
        }
        return { status: 'completed', action: action.kind, observed };
      } catch {
        // POM/Playwright errors may contain page data. Never forward their
        // message through this capability boundary.
        return { status: 'failed', action: action.kind, message: 'POM operation failed' };
      }
    },
  });
}

/** Parse an explicit action allowlist; unknown values fail closed. */
export function parsePomActionAllowlist(value: string | undefined): readonly PomReadActionKind[] {
  if (!value?.trim()) return [];
  const requested = value.split(',').map((action) => action.trim()).filter(Boolean);
  if (requested.some((action) => !ACTION_KINDS.includes(action as PomReadActionKind))) {
    throw new Error('AGENTIC_POM_ALLOWED_ACTIONS contains an unsupported action');
  }
  return [...new Set(requested)] as PomReadActionKind[];
}

function isPomReadAction(action: unknown): action is PomReadAction {
  if (typeof action !== 'object' || action === null || !('kind' in action)) return false;
  const candidate = action as Record<string, unknown>;
  switch (candidate.kind) {
    case 'dashboard.verify-menu':
      return typeof candidate.menuOption === 'string';
    case 'dashboard.verify-search-results':
      return typeof candidate.searchItem === 'string';
    case 'dashboard.verify-menu-hidden':
      return true;
    default:
      return false;
  }
}

function actionInput(action: PomReadAction): string {
  switch (action.kind) {
    case 'dashboard.verify-menu':
      return action.menuOption;
    case 'dashboard.verify-search-results':
      return action.searchItem;
    case 'dashboard.verify-menu-hidden':
      return '';
  }
}
