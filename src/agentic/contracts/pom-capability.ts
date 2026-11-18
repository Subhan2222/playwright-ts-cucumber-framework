/**
 * Deliberately small, read-only Page Object operations. These are not Playwright
 * primitives: callers cannot obtain a Page, locator, context, or page manager.
 */
export type PomReadAction =
  | { readonly kind: 'dashboard.verify-menu'; readonly menuOption: string }
  | { readonly kind: 'dashboard.verify-search-results'; readonly searchItem: string }
  | { readonly kind: 'dashboard.verify-menu-hidden' };

export type PomReadActionKind = PomReadAction['kind'];

export interface PomCapabilityPolicy {
  readonly enabled: boolean;
  readonly allowedActions: readonly PomReadActionKind[];
  readonly maxCalls: number;
  readonly maxInputChars: number;
}

export interface PomCapability {
  invoke(action: PomReadAction): Promise<PomCapabilityResult>;
}

export type PomCapabilityResult =
  | {
      readonly status: 'completed';
      readonly action: PomReadActionKind;
      readonly observed: boolean;
    }
  | { readonly status: 'denied'; readonly action?: PomReadActionKind; readonly message: string }
  | { readonly status: 'failed'; readonly action: PomReadActionKind; readonly message: string };

/** Internal, fixed-operation bridge to existing Page Objects. */
export interface PomReadExecutor {
  verifyDashboardMenu(menuOption: string): Promise<boolean>;
  verifySearchResults(searchItem: string): Promise<boolean>;
  verifyMenuHidden(): Promise<boolean>;
}
