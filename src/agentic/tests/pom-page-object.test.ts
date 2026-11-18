import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Page } from '@playwright/test';
import type { PomCapabilityPolicy } from '../contracts/pom-capability';
import { createScenarioPomCapability } from '../integrations/cucumber/pom-capability';
import type { CucumberWorld } from '../integrations/cucumber/world';
import { dashboardPage } from '../../pages/dashBoardPage';

const expectedMenuOptions = [
  'Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info',
  'Performance', 'Dashboard', 'Directory', 'Maintenance', 'Claim', 'Buzz',
];

test('scenario capability dispatches only through the dashboard Page Object observations', async () => {
  const calls: string[] = [];
  const hiddenAwareQueries: string[] = [];
  const menuState = new Map<string, { present: boolean; visible: boolean }>([
    ...expectedMenuOptions.map((option) => [
      option,
      { present: true, visible: option === 'Admin' },
    ] as const),
    ['User Reports', { present: false, visible: false }],
  ]);
  const fakePage = {
    getByPlaceholder: (placeholder: string) => {
      calls.push(`placeholder:${placeholder}`);
      return { fill: async () => undefined, press: async () => undefined };
    },
    locator: (selector: string) => {
      calls.push(`locator:${selector}`);
      return {
        click: async () => undefined,
        count: async () => 0,
        isVisible: async () => false,
      };
    },
    getByRole: (
      role: string,
      options: { name: string | RegExp; exact?: boolean; includeHidden?: boolean }
    ) => {
      const name = String(options.name);
      calls.push(`role:${role}:${name}:${options.exact === true}`);
      if (typeof options.name === 'string' && options.includeHidden === true) {
        hiddenAwareQueries.push(options.name);
      }
      const state = typeof options.name === 'string' ? menuState.get(options.name) : undefined;
      return {
        isVisible: async () => state?.visible ?? false,
        count: async () => state?.present ? 1 : 0,
      };
    },
  } as unknown as Page;
  const dashboard = new dashboardPage(fakePage);
  const world = {
    pageManager: { getDashboardPage: () => dashboard },
  } as unknown as CucumberWorld;
  const policy: PomCapabilityPolicy = {
    enabled: true,
    allowedActions: [
      'dashboard.verify-menu',
      'dashboard.verify-search-results',
      'dashboard.verify-menu-hidden',
    ],
    maxCalls: 3,
    maxInputChars: 120,
  };
  const capability = createScenarioPomCapability(world, policy);

  assert.deepEqual(
    await capability.invoke({ kind: 'dashboard.verify-menu', menuOption: 'Admin' }),
    { status: 'completed', action: 'dashboard.verify-menu', observed: true }
  );
  assert.deepEqual(
    await capability.invoke({
      kind: 'dashboard.verify-search-results',
      searchItem: 'User Reports',
    }),
    { status: 'completed', action: 'dashboard.verify-search-results', observed: false }
  );
  assert.deepEqual(
    await capability.invoke({ kind: 'dashboard.verify-menu-hidden' }),
    { status: 'completed', action: 'dashboard.verify-menu-hidden', observed: false }
  );

  assert.ok(calls.includes('placeholder:Search'));
  assert.ok(calls.includes('locator://button[@class="oxd-icon-button oxd-main-menu-button"]'));
  assert.ok(calls.includes('role:link:Admin:true'));
  assert.ok(calls.includes('role:link:User Reports:true'));
  assert.ok(!calls.includes('role:link:menuOption:true'));
  assert.deepEqual(hiddenAwareQueries, expectedMenuOptions);
  assert.deepEqual(Reflect.ownKeys(capability), ['invoke']);
});

test('menu-hidden observation requires rendered dashboard menu evidence', async () => {
  const createPage = (menuState: Map<string, { present: boolean; visible: boolean }>): Page => ({
    getByPlaceholder: () => ({ fill: async () => undefined, press: async () => undefined }),
    locator: () => ({ click: async () => undefined }),
    getByRole: (_role: string, options: { name: string | RegExp }) => {
      const state = typeof options.name === 'string' ? menuState.get(options.name) : undefined;
      return {
        count: async () => state?.present ? 1 : 0,
        isVisible: async () => state?.visible ?? false,
      };
    },
  } as unknown as Page);

  const hiddenMenuState = new Map(
    expectedMenuOptions.map((option) => [option, { present: true, visible: false }] as const)
  );
  const hiddenDashboardMenu = new dashboardPage(createPage(hiddenMenuState));
  assert.equal(await hiddenDashboardMenu.isMenuHidden(), true);

  const visibleMenuState = new Map(
    expectedMenuOptions.map((option) => [
      option,
      { present: true, visible: option === 'Admin' },
    ] as const)
  );
  const visibleDashboardMenu = new dashboardPage(createPage(visibleMenuState));
  assert.equal(await visibleDashboardMenu.isMenuHidden(), false);

  const absentDashboardMenu = new dashboardPage(createPage(new Map()));
  assert.equal(await absentDashboardMenu.isMenuHidden(), false);

  const partialDashboardMenu = new dashboardPage(createPage(new Map([
    ['Admin', { present: true, visible: false }],
  ])));
  assert.equal(await partialDashboardMenu.isMenuHidden(), false);
});

test('legacy menu-hidden assertion uses the same complete menu observation', async () => {
  const hiddenAwareQueries: string[] = [];
  const fakePage = {
    getByPlaceholder: () => ({ fill: async () => undefined, press: async () => undefined }),
    locator: () => ({ click: async () => undefined }),
    getByRole: (_role: string, options: {
      name: string | RegExp;
      exact?: boolean;
      includeHidden?: boolean;
    }) => {
      if (typeof options.name === 'string' && options.includeHidden === true) {
        hiddenAwareQueries.push(options.name);
      }
      const isKnownMenuItem =
        typeof options.name === 'string' && expectedMenuOptions.includes(options.name);
      return {
        count: async () => isKnownMenuItem ? 1 : 0,
        isVisible: async () => false,
      };
    },
  } as unknown as Page;
  const dashboard = new dashboardPage(fakePage);

  await dashboard.verifyMenuHidden();

  assert.deepEqual(hiddenAwareQueries, expectedMenuOptions);
});
