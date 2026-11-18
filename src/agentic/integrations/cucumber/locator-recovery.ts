import type { Locator, Page } from 'playwright';

export type LocatorRecoveryAction = 'click' | 'fill' | 'press';
export type LocatorRecoveryStrategy =
  | 'role'
  | 'label'
  | 'placeholder'
  | 'id'
  | 'name';
export type LocatorRecoveryRole = 'button' | 'link' | 'textbox' | 'combobox';

export interface LocatorRecoveryCandidate {
  readonly id: string;
  readonly strategy: LocatorRecoveryStrategy;
  readonly value: string;
  readonly role?: LocatorRecoveryRole;
  readonly description: string;
}

export interface LocatorRecoveryRequest {
  readonly action: LocatorRecoveryAction;
  readonly target: string;
  readonly candidates: readonly LocatorRecoveryCandidate[];
}

export interface LocatorRecoveryService {
  suggest(request: LocatorRecoveryRequest): Promise<string | undefined>;
  approve(candidate: LocatorRecoveryCandidate, action: LocatorRecoveryAction): Promise<boolean>;
  report(message: string): Promise<void>;
}

const MAX_CANDIDATES = 40;
const MAX_DESCRIPTION_CHARS = 100;

interface ObservedControl {
  readonly tag: string;
  readonly role: LocatorRecoveryRole | '';
  readonly label: string;
  readonly placeholder: string;
  readonly id: string;
  readonly name: string;
}

interface CandidateScanOptions {
  readonly maxCandidates: number;
  readonly maxDescriptionChars: number;
}

export async function performLocatorAction(
  page: Page,
  locator: Locator,
  recovery: LocatorRecoveryService | undefined,
  action: LocatorRecoveryAction,
  target: string,
  perform: (locator: Locator) => Promise<void>
): Promise<void> {
  const startingUrl = page.url();

  try {
    await perform(locator);
    return;
  } catch (originalError) {
    if (!recovery || page.url() !== startingUrl) throw originalError;
    if (!isMissingLocatorFailure(originalError)) throw originalError;

    let originalCount: number;
    try {
      originalCount = await locator.count();
    } catch {
      throw originalError;
    }
    if (originalCount !== 0) throw originalError;

    const candidates = await discoverCandidates(page, action);
    if (candidates.length === 0) {
      await recovery.report(`No safe locator candidates were found for "${target}". The original test failure is unchanged.`);
      throw originalError;
    }

    let suggestedId: string | undefined;
    try {
      suggestedId = await recovery.suggest({
        action,
        target: target.slice(0, MAX_DESCRIPTION_CHARS),
        candidates,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown suggestion error';
      await recovery.report(`Locator suggestion failed: ${message}. The original test failure is unchanged.`);
      throw originalError;
    }

    const candidate = candidates.find(({ id }) => id === suggestedId);
    if (!candidate) {
      await recovery.report('No sufficiently strong, unique locator match was found. No retry was attempted.');
      throw originalError;
    }

    const fallback = buildCandidateLocator(page, candidate);
    if (await fallback.count() !== 1
      || !(await fallback.isVisible())
      || !(await fallback.isEnabled())) {
      await recovery.report(`Suggested locator "${candidate.description}" is not unique, visible, and enabled. No retry was attempted.`);
      throw originalError;
    }

    await recovery.report(
      `Suggested locator recovery\nAction: ${action}\nTarget: ${target}\nCandidate: ${candidate.description}\nApproval required before one retry.`
    );

    if (!(await recovery.approve(candidate, action))) {
      await recovery.report('Locator recovery was not approved or interactive approval is unavailable. Scenario remains failed.');
      throw originalError;
    }

    try {
      await perform(fallback);
      await recovery.report(`Approved locator recovery succeeded using "${candidate.description}".`);
    } catch (retryError) {
      const message = retryError instanceof Error ? retryError.message : 'Unknown retry error';
      await recovery.report(`Approved locator recovery retry failed: ${message}`);
      throw retryError;
    }
  }
}

export function createSelfHealingPage(
  page: Page,
  recovery: LocatorRecoveryService,
  getCurrentStep: () => string
): Page {
  return wrapPage(page, page, recovery, getCurrentStep);
}

function wrapPage(
  page: Page,
  pageTarget: Page,
  recovery: LocatorRecoveryService,
  getCurrentStep: () => string
): Page {
  return new Proxy(pageTarget, {
    get(target, property) {
      const value = Reflect.get(target, property, target) as unknown;
      if (typeof property !== 'string' || typeof value !== 'function') return value;
      return (...args: unknown[]) => {
        const result: unknown = Reflect.apply(value, target, args);
        if (PAGE_LOCATOR_METHODS.has(property) && isLocator(result)) {
          return wrapLocator(
            result,
            `${property} ${formatLocatorArguments(args)} ${getCurrentStep()}`,
            page,
            recovery,
            getCurrentStep
          );
        }
        return result;
      };
    },
  });
}

function wrapLocator(
  locator: Locator,
  target: string,
  page: Page,
  recovery: LocatorRecoveryService,
  getCurrentStep: () => string
): Locator {
  return new Proxy(locator, {
    get(locatorTarget, property) {
      const value = Reflect.get(locatorTarget, property, locatorTarget) as unknown;
      if (typeof property !== 'string' || typeof value !== 'function') return value;

      const action = locatorAction(property);
      if (action) {
        return (...args: unknown[]) => performLocatorAction(
          page,
          locatorTarget,
          recovery,
          action,
          `${target} ${getCurrentStep()}`,
          (replacement) => Reflect.apply(value, replacement, args) as Promise<void>
        );
      }

      return (...args: unknown[]) => {
        const result: unknown = Reflect.apply(value, locatorTarget, args);
        if (LOCATOR_CHAIN_METHODS.has(property) && isLocator(result)) {
          return wrapLocator(
            result,
            `${target} ${property} ${formatLocatorArguments(args)} ${getCurrentStep()}`,
            page,
            recovery,
            getCurrentStep
          );
        }
        return result;
      };
    },
  });
}

const PAGE_LOCATOR_METHODS = new Set([
  'locator', 'getByRole', 'getByLabel', 'getByPlaceholder', 'getByText',
  'getByAltText', 'getByTitle', 'getByTestId',
]);

const LOCATOR_CHAIN_METHODS = new Set([
  'locator', 'getByRole', 'getByLabel', 'getByPlaceholder', 'getByText',
  'getByAltText', 'getByTitle', 'getByTestId', 'filter', 'nth', 'first', 'last',
]);

function isLocator(value: unknown): value is Locator {
  return typeof value === 'object'
    && value !== null
    && 'click' in value
    && 'count' in value
    && typeof value.click === 'function'
    && typeof value.count === 'function';
}

function locatorAction(property: string): LocatorRecoveryAction | undefined {
  if (property === 'click') return 'click';
  if (property === 'fill') return 'fill';
  if (property === 'press') return 'press';
  return undefined;
}

function formatLocatorArguments(args: readonly unknown[]): string {
  return args.map((value) => {
    if (typeof value === 'string') return value.slice(0, MAX_DESCRIPTION_CHARS);
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .filter(([, entry]) => typeof entry === 'string' || typeof entry === 'number')
        .map(([key, entry]) => `${key} ${String(entry).slice(0, MAX_DESCRIPTION_CHARS)}`)
        .join(' ');
    }
    return '';
  }).filter(Boolean).join(' ').slice(0, MAX_DESCRIPTION_CHARS);
}

function isMissingLocatorFailure(error: unknown): boolean {
  return error instanceof Error
    && /timeout.*waiting for locator\(/is.test(error.message);
}

async function discoverCandidates(
  page: Page,
  action: LocatorRecoveryAction
): Promise<LocatorRecoveryCandidate[]> {
  const controls = await page.locator(
    'button, a, input, textarea, select, [role=button], [role=link], [role=textbox], [role=combobox]'
  ).evaluateAll((elements: Element[], options: CandidateScanOptions): ObservedControl[] => elements
    .filter((element) => {
      const style = window.getComputedStyle(element);
      return element.getClientRects().length > 0
        && style.visibility !== 'hidden'
        && style.display !== 'none'
        && !(element instanceof HTMLInputElement && ['hidden', 'file'].includes(element.type));
    })
    .slice(0, options.maxCandidates)
    .map((element) => {
      const clean = (value: string): string => value
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, options.maxDescriptionChars);
      const tag = element.tagName.toLowerCase();
      const input = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
      const inputType = element instanceof HTMLInputElement ? element.type : '';
      const rawRole = element.getAttribute('role')
        || (tag === 'button' || (tag === 'input' && ['button', 'submit', 'reset'].includes(inputType))
          ? 'button'
          : tag === 'a' ? 'link'
            : input && (!inputType || ['text', 'password', 'email', 'search', 'tel', 'url'].includes(inputType))
              ? 'textbox'
              : tag === 'select' ? 'combobox' : '');
      const labels = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
        ? Array.from(element.labels ?? []).map((label) => label.innerText.trim()).filter(Boolean)
        : [];
      const label = element.getAttribute('aria-label')
        || labels[0]
        || (element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement
          ? element.innerText.trim()
          : '');
      return {
        tag,
        role: rawRole === 'button' || rawRole === 'link' || rawRole === 'textbox' || rawRole === 'combobox'
          ? rawRole
          : '',
        label: clean(label),
        placeholder: clean(element.getAttribute('placeholder') ?? ''),
        id: clean(element.id),
        name: clean(element.getAttribute('name') ?? ''),
      };
    }), {
      maxCandidates: MAX_CANDIDATES,
      maxDescriptionChars: MAX_DESCRIPTION_CHARS,
    });

  const candidates: LocatorRecoveryCandidate[] = [];
  const seen = new Set<string>();

  const add = (
    strategy: LocatorRecoveryStrategy,
    value: string,
    description: string,
    role?: LocatorRecoveryRole
  ): void => {
    if (!value) return;
    const key = `${strategy}\0${role ?? ''}\0${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({
      id: `c${candidates.length + 1}`,
      strategy,
      value,
      description,
      ...(role ? { role } : {}),
    });
  };

  for (const control of controls) {
    const actionableRole = action === 'click'
      ? control.role === 'button' || control.role === 'link'
      : control.role === 'textbox';
    if (!actionableRole) continue;

    if (control.label && control.role) {
      add('role', control.label, `${control.role} named "${control.label}"`, control.role);
    }
    if (control.label && control.tag !== 'button' && control.tag !== 'a') {
      add('label', control.label, `label "${control.label}"`);
    }
    if (control.placeholder) {
      add('placeholder', control.placeholder, `placeholder "${control.placeholder}"`);
    }
    if (control.id) add('id', control.id, `id "${control.id}"`);
    if (control.name) add('name', control.name, `name "${control.name}"`);
    if (candidates.length >= MAX_CANDIDATES) break;
  }

  return candidates.slice(0, MAX_CANDIDATES);
}

function buildCandidateLocator(page: Page, candidate: LocatorRecoveryCandidate): Locator {
  switch (candidate.strategy) {
    case 'role':
      if (!candidate.role) throw new Error('Role locator candidate is missing its role.');
      return page.getByRole(candidate.role, {
        name: candidate.value,
        exact: true,
      });
    case 'label':
      return page.getByLabel(candidate.value, { exact: true });
    case 'placeholder':
      return page.getByPlaceholder(candidate.value, { exact: true });
    case 'id':
      return page.locator(`[id=${JSON.stringify(candidate.value)}]`);
    case 'name':
      return page.locator(`[name=${JSON.stringify(candidate.value)}]`);
  }
}
