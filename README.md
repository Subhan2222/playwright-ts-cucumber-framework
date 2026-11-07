# Playwright TypeScript Cucumber Framework

A browser end-to-end testing framework using Playwright, TypeScript, and Cucumber/Gherkin. This guide describes how the current repository is organized, how to run it, and how to add tests. It is intended to grow alongside the framework: when a command, folder, configuration, or workflow changes, update the corresponding section here in the same change.

## What this framework does

- Describes test scenarios in readable Gherkin feature files.
- Connects Gherkin steps to TypeScript step definitions.
- Uses Playwright to automate Chromium, Firefox, or WebKit.
- Organizes browser interactions in page objects and provides them through a page-object manager.
- Produces Cucumber HTML/JSON and Allure results.
- Supports encrypted environment URLs and user data.
- Runs the Cucumber suite in GitHub Actions.

## 1. Prerequisites

- Node.js 20 (the GitHub Actions workflow uses Node.js 20).
- npm, included with Node.js.
- Git.
- Access to this repository and the test environment.
- The `ENV_SECRET` value used to encrypt the environment and user-data files. Do not commit this value or decrypted test data.

Recommended VS Code extensions: ESLint, Prettier, Cucumber (Gherkin) Full Support, and Playwright Test for VS Code.

## 2. Get the project and install dependencies

```bash
git clone https://github.com/Subhan2222/playwright-ts-cucumber-framework.git
cd playwright-ts-cucumber-framework
npm ci
npx playwright install chromium
```

Use `npm ci` for a clean install from the committed `package-lock.json`. `npx playwright install chromium` installs the browser used by default. To run another browser locally, install it too:

```bash
npx playwright install firefox
# or
npx playwright install webkit
```

## 3. Understand the project layout

```text
config/                 Playwright and alternate Cucumber configuration
data/
  envData/              Encrypted environment URL configuration
  userData/             Encrypted test user data
src/
  features/             Gherkin scenarios
  pages/                Page objects and POManager
  steps/                TypeScript implementations of Gherkin steps
support/hooks.ts        Browser and scenario lifecycle
utils/                  Shared browser, environment, and data helpers
utils/scripts/          Encryption, decryption, and report scripts
.github/workflows/      GitHub Actions CI workflow
cucumber.json           Cucumber CLI configuration used by npm run cucumber
```

The `npm run cucumber` command uses `cucumber.json`: it loads `support/hooks.ts` and all `src/steps/**/*.ts`, then runs features under `src/features/**/*.feature`. The separate `config/playwright.config.ts` is present for Playwright Test usage; the current npm scripts execute Cucumber, not the native Playwright Test runner.

### Configuration files: why they exist and how to use them

These configuration files serve different runners. Cucumber executes the current BDD suite; Playwright Test is a separate runner for tests written with Playwright's `test()` API. The presence of both configurations does not mean they are both used by `npm run cucumber`.

| File | Why it exists | Used by now? |
| --- | --- | --- |
| `cucumber.json` | Tells Cucumber which hooks, step definitions, feature files, TypeScript support, and report formatters to use. | Yes. This is the config picked up by `npm run cucumber`. |
| `config/cucumber.config.ts` | A TypeScript-formatted alternative Cucumber config with similar feature, step, and report settings. It can be a single place for Cucumber settings if the command is explicitly wired to it. | No. The current script does not name this file; treat `cucumber.json` as authoritative for now. |
| `config/playwright.config.ts` | Holds settings for the separate Playwright Test runner, such as test folder, timeout, headless mode, and base URL. | No. The current npm test scripts run Cucumber, not Playwright Test. |
| `support/hooks.ts` | Starts/stops the browser, creates scenario pages, applies runtime browser settings, and handles failure artifacts. | Yes. Loaded by `cucumber.json`. |
| `tsconfig.json` | Configures how TypeScript is checked and compiled, including strict type checking and module settings. | Yes. Used by TypeScript tooling and `ts-node`. |

#### `cucumber.json` — the active Cucumber setup

Cucumber uses this file when `npm run cucumber` runs `cucumber-js`. It connects the Gherkin files to executable TypeScript code:

- `require` loads `support/hooks.ts` and all step definitions under `src/steps/`.
- `requireModule` loads `ts-node/register`, so Cucumber can execute the TypeScript files directly.
- `paths` selects `.feature` files under `src/features/`.
- `format` writes progress to the terminal and generates HTML, JSON, and Allure results.
- `formatOptions.resultsDir` tells the Allure formatter where to write its results.

For example, the relevant shape is:

```json
{
  "default": {
    "require": ["support/hooks.ts", "src/steps/**/*.ts"],
    "requireModule": ["ts-node/register"],
    "format": [
      "progress",
      "html:test-results/reports/cucumber-report.html",
      "json:test-results/reports/cucumber-report.json",
      "allure-cucumberjs/reporter"
    ],
    "formatOptions": {
      "resultsDir": "test-results/allure-results"
    },
    "paths": ["src/features/**/*.feature"]
  }
}
```

For normal Cucumber work, edit this active config when changing feature discovery, step loading, hooks, or report output. Run it with:

```bash
npm run cucumber
```

#### `config/cucumber.config.ts` — the alternate Cucumber config

This file represents the same kind of configuration in TypeScript syntax. A TypeScript config can be convenient when a project wants to maintain its runner settings as code. In this repository it is currently not wired into the `cucumber` npm script, and its options are not completely identical to `cucumber.json` (for example, it does not list `requireModule`).

That means editing this file alone will not change the behavior of `npm run cucumber`. For now, keep `cucumber.json` as the source of truth. If you later decide to switch, update the npm script to explicitly select this config and verify that the chosen Cucumber command can load the TypeScript config and register `ts-node`; then remove or clearly mark the duplicate config to prevent them drifting apart.

#### `config/playwright.config.ts` — for native Playwright Test tests

The filename here is **`playwright.config.ts`**, not `.js`. `.js` is another common extension in JavaScript projects, but this repository's config is written in TypeScript. It uses Playwright Test's `defineConfig()` to set defaults for tests written with `@playwright/test`'s `test()` and `expect()` APIs.

The current settings mean:

- `testDir: './tests'` looks for native Playwright Test files in the root `tests/` directory.
- `timeout` sets the per-test timeout, using `TIMEOUT` when defined and otherwise 30 seconds.
- `use.headless` runs browsers headlessly unless `HEADLESS=false`.
- `use.baseURL` provides a default base URL from `BASE_URL`, or `https://example.com`.

To use this config, first add native Playwright Test files (usually named `*.spec.ts`) under `tests/`, then run that runner explicitly:

```bash
npx playwright test --config=config/playwright.config.ts
```

This is a different test style from the current Gherkin/Cucumber tests. Cucumber's browser is created in `support/hooks.ts`, and the current Cucumber navigation uses `baseUrl` from the encrypted `data/envData/envUrls.json` config. It does not get its browser or base URL from `config/playwright.config.ts`.

#### TypeScript and runtime environment settings

`tsconfig.json` enables strict type checking, targets ES2020, uses CommonJS module output, and includes TypeScript files in the project. This is important for catching type mistakes and running TypeScript support code through `ts-node`.

The Cucumber hooks use these runtime variables:

| Variable | Used by | Default / behavior |
| --- | --- | --- |
| `BROWSER` | Cucumber hooks | `chromium`; supports `firefox` and `webkit` too. |
| `HEADLESS` | Cucumber hooks and Playwright config | Headless unless its value is `false` (case-insensitive). |
| `TIMEOUT` | Cucumber hooks and Playwright config | Cucumber: 60,000 ms; Playwright Test: 30,000 ms. For Cucumber, export it in the shell or CI environment; the hook reads it before calling `dotenv.config()`. |
| `ENV_SECRET` | Environment URL encryption/decryption | Required for encrypted environment URLs. |
| `USER_SECRET` | User-data encryption/decryption | Optional; falls back to `ENV_SECRET`. |

For example, set test execution options in the shell for one run:

```bash
BROWSER=firefox HEADLESS=false TIMEOUT=90000 npm run cucumber
```

The native Playwright Test config also reads `BASE_URL` and defaults it to `https://example.com`. The current Cucumber steps do not use that `BASE_URL`; they get the site base URL from the encrypted URL configuration (`baseUrl` in `envUrls.json`). Configure the correct source depending on which runner is being used.

## 4. Configure test URLs and credentials

The framework keeps environment URLs in `data/envData/envUrls.json.enc` and test users in `data/userData/userData.json.enc`. Set `ENV_SECRET` in your shell or a local, untracked `.env` file:

```dotenv
ENV_SECRET=your-private-encryption-secret
```

Keep `.env` and decrypted data private. `.gitignore` excludes `.env`, `data/envData/envUrls.json`, and `data/userData/userData.json`. Never paste real credentials into source code, examples, commits, or chat.

### Environment URL file

The plaintext URL file is `data/envData/envUrls.json`. It contains a base URL and paths used by steps. For example, use safe placeholder values like these and replace them with URLs for your own test environment:

```json
{
  "baseUrl": "https://your-test-site.example",
  "loginPath": "/web/index.php/auth/login",
  "searchPath": "/web/index.php"
}
```

In the login navigation step, `getEnvConfig()` reads the configuration and the `basePage` helper combines `baseUrl` and `loginPath` before calling Playwright's `page.goto()`. The configuration is cached in memory so later calls reuse it:

```typescript
const env = getEnvConfig();
await page.navigateTo(env.loginPath);
```

If a plaintext `data/envData/envUrls.json` exists, `getEnvConfig()` reads that file. Otherwise, it decrypts `data/envData/envUrls.json.enc` into memory. The Cucumber `BeforeAll` hook also explicitly decrypts the encrypted URL file before launching the browser. The runtime decryption function does not write a plaintext URL file to disk.

### Encrypt and decrypt environment URLs

To create or update the encrypted URL file:

1. Create `data/envData/envUrls.json` with the required URL fields.
2. Set `ENV_SECRET` in `.env` or the shell.
3. Run:

```bash
npm run encrypt-env
```

The script writes `data/envData/envUrls.json.enc` and removes the plaintext input file. To explicitly create a plaintext copy for local inspection or editing, run:

```bash
npm run decrypt-env
```

This command writes `data/envData/envUrls.json` and leaves it on disk. After editing, run `npm run encrypt-env` again; that script updates the encrypted file and removes the plaintext copy. Do not commit or share the decrypted file.

### Encrypt and decrypt user data

The encrypted user file is `data/userData/userData.json.enc`. Its plaintext source is `data/userData/userData.json`. The helper supports user records with ID, username, and password fields, for example:

```json
[
  {
    "UserId": 1,
    "UserName": "example-test-user",
    "UserPassword": "replace-with-a-private-test-password"
  }
]
```

Use only non-working placeholders in documentation. To create or update the encrypted file, create the private plaintext JSON locally, set `USER_SECRET` (or use `ENV_SECRET`), and run:

```bash
npm run encrypt-user-data
```

This writes `data/userData/userData.json.enc` and deletes the plaintext source. For local troubleshooting, `npm run decrypt-user-data` writes `data/userData/userData.json` and leaves it on disk; encrypt it again after editing to remove the plaintext file.

During test execution, `decryptUserDataFile()` reads the encrypted user data into memory, and `getUserCredentialsById("1")` selects the matching record. The current login step then fills the username and password fields. This normal runtime helper does not need to create a plaintext user-data file.

### Secret setup in CI

The CI workflow expects `ENV_SECRET` to be configured as a GitHub Actions repository secret. Add it under **Settings → Secrets and variables → Actions**. The workflow does not print or store the secret in the repository. If user data is encrypted with a separate `USER_SECRET`, add that GitHub Actions secret too and pass it to the test job.

## 5. Understand the Cucumber hooks

`cucumber.json` loads `support/hooks.ts` before the step definitions. The hooks manage shared browser startup and cleanup, then create an isolated browser context for each scenario:

1. **`BeforeAll` runs once before the suite.** It decrypts the URL configuration into memory, chooses the browser from `BROWSER` (Chromium by default), and launches it. `HEADLESS=false` shows the browser window.
2. **`Before` runs before each scenario.** It creates a new context with a 1280×720 viewport, starts Playwright tracing (screenshots, DOM snapshots, and sources), creates a page, and constructs a `POManager` on the Cucumber World (`this.pageManager`).
3. **`BeforeStep` and `AfterStep` run around each step.** They log step start and pass/fail status to the console.
4. **`After` runs after each scenario.** On failure, it attaches the error text, a screenshot, and the trace to the Cucumber result. It stops tracing, then closes the page and context. Successful scenarios stop tracing without attaching a failure trace.
5. **`AfterAll` runs once at suite end.** It closes the shared browser.

This is the basic lifecycle in the current hooks file:

```typescript
BeforeAll(async function () {
  await decryptEnvFile();
  globalBrowser = await chromium.launch({ headless: true });
});

Before(async function () {
  this.context = await globalBrowser.newContext();
  this.page = await this.context.newPage();
  this.pageManager = new POManager(this.page);
});
```

The example is intentionally shortened; `support/hooks.ts` contains the browser selection, tracing, failure attachments, and cleanup logic used by the framework.

## 6. Add a feature in Gherkin

Create a `.feature` file under `src/features/`. A feature describes behavior, while step definitions contain the executable code. For example, the existing login feature uses a `Background` to navigate to the login page before each scenario:

```gherkin
@login @regression
Feature: OrangeHRM Login Page

  Background:
    Given the user navigates to the OrangeHRM login page

  @PositiveLogin @smoke
  Scenario: Login with valid credentials
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
```

Use tags such as `@smoke` and `@regression` to select related scenarios. A `Scenario Outline` with an `Examples` table is useful for repeating the same behavior with multiple input values.

## 7. Implement steps and page objects

Add matching Cucumber step definitions under `src/steps/`. Keep these focused on translating a scenario into page-object calls. This follows the current login step pattern and uses the `POManager` initialized by the scenario hook:

```typescript
When('the user enters username {string}', async function (username: string): Promise<void> {
  const loginPage = this.pageManager.getLoginPage();
  await loginPage.enterUsername(username);
});
```

Add selectors and browser interactions to the relevant page object under `src/pages/`, rather than placing raw selectors in feature files. For example:

```typescript
this.usernameInput = page.locator('input[name="username"]');

public async enterUsername(username: string): Promise<void> {
  await this.usernameInput.fill(username);
}
```

If adding a new page object, register a getter for it in `src/pages/POManager.ts`. `support/hooks.ts` creates a fresh browser context and page for each scenario and puts a `POManager` instance on the Cucumber World as `this.pageManager`.

## 8. Run tests

Run all configured Cucumber features:

```bash
npm run cucumber
```

Run only tagged scenarios:

```bash
npm run smoke
npm run regression
# Or pass a Cucumber tag expression directly:
npm run cucumber -- --tags "@login and @smoke"
```

Useful environment options:

```bash
BROWSER=firefox npm run cucumber
HEADLESS=false npm run cucumber
TIMEOUT=90000 npm run cucumber
```

`BROWSER` supports `chromium`, `firefox`, and `webkit`; it defaults to Chromium. `HEADLESS` defaults to headless mode; set it to `false` for a visible browser. `TIMEOUT` sets the Cucumber step timeout in milliseconds.

The `test` script in `package.json` is currently a placeholder and exits with an error. Use `npm run cucumber` for the actual test suite.

## 9. Review reports and failure artifacts

The Cucumber configuration writes:

- `test-results/reports/cucumber-report.html`
- `test-results/reports/cucumber-report.json`
- `test-results/allure-results/`

Generate and open the Allure report:

```bash
npm run allure:generate
npm run allure:open
```

`support/hooks.ts` attaches an error message, screenshot, and Playwright trace to failed scenarios when available. Generated reports and test results are local artifacts; the GitHub Actions workflow uploads the Cucumber and Allure result directories even when tests fail.

## 10. Continuous integration

The workflow at `.github/workflows/e2e-tests.yml` runs for pushes, pull requests, or manual dispatch. It checks out the repository, sets up Node.js 20, installs dependencies with `npm ci`, installs Chromium, runs `npm run cucumber`, and uploads reports.

Before enabling CI for a repository, add `ENV_SECRET` as a repository Actions secret. Test URLs and credentials must also be reachable/valid from the GitHub-hosted runner. The current workflow installs Chromium only; update the workflow if the suite is expanded to run other browsers.

## 11. Add or change framework behavior

When adding a test or changing framework behavior, update the appropriate layer:

1. Add or update the Gherkin scenario in `src/features/`.
2. Add or update its step definitions in `src/steps/`.
3. Implement browser actions and assertions in a page object in `src/pages/`.
4. Register new page objects in `src/pages/POManager.ts`.
5. Add shared setup or teardown only when needed in `support/hooks.ts`.
6. Update this guide when commands, setup, configuration, reports, secrets, or workflow behavior changes.
7. Run the smallest relevant test locally and inspect the generated report.

Keep scenario language readable, reuse existing steps/page objects where practical, and never commit decrypted test data or secrets.

## 12. Common Git commands

```bash
git status
git add <files>
git commit -m "Describe the change"
git push
```
