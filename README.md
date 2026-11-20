# Playwright TypeScript Cucumber Framework

A browser end-to-end testing framework using **Playwright**, **TypeScript**, and **Cucumber/Gherkin**.
This guide describes how the repository is organized, how to run it, and how to add tests.
Update the relevant section here whenever a command, folder, config, or workflow changes.

---

## Table of Contents

1. [What this framework does](#what-this-framework-does)
2. [Prerequisites](#1-prerequisites)
3. [Get the project and install dependencies](#2-get-the-project-and-install-dependencies)
4. [Project layout](#3-understand-the-project-layout)
5. [Configuration files](#configuration-files-why-they-exist-and-how-to-use-them)
6. [Configure test URLs and credentials](#4-configure-test-urls-and-credentials)
7. [Understand the Cucumber hooks](#5-understand-the-cucumber-hooks)
8. [Add a feature in Gherkin](#6-add-a-feature-in-gherkin)
9. [Implement steps and page objects](#7-implement-steps-and-page-objects)
10. [Run tests](#8-run-tests)
11. [Reports and failure artifacts](#9-review-reports-and-failure-artifacts)
12. [Agentic AI Testing (Ollama)](#10-agentic-ai-testing-ollama)
13. [Continuous integration](#11-continuous-integration)
14. [Add or change framework behavior](#12-add-or-change-framework-behavior)
15. [Common Git commands](#13-common-git-commands)

---

## What this framework does

| Capability | Detail |
|---|---|
| Gherkin scenarios | Readable `.feature` files describe test behavior |
| Step definitions | TypeScript connects Gherkin steps to browser actions |
| Browser automation | Playwright drives Chromium, Firefox, or WebKit |
| Page Object Model | Browser interactions live in page objects via `POManager` |
| Reporting | Cucumber HTML/JSON + Allure results |
| Security | Encrypted environment URLs and user data |
| CI/CD | GitHub Actions workflow included |
| AI layer (opt-in) | Local Ollama model for failure diagnosis and self-healing locators |

---

## 1. Prerequisites

- **Node.js 20** (GitHub Actions uses Node.js 20)
- **npm** — included with Node.js
- **Git**
- Access to this repository and the test environment
- The `ENV_SECRET` value for encrypted environment/user-data files — **never commit this**

> **Recommended VS Code extensions:** ESLint · Prettier · Cucumber (Gherkin) Full Support · Playwright Test for VS Code

---

## 2. Get the project and install dependencies

```bash
git clone https://github.com/Subhan2222/playwright-ts-cucumber-framework.git
cd playwright-ts-cucumber-framework
npm ci
npx playwright install chromium
```

> Use `npm ci` for a clean, locked install from `package-lock.json`.

To run other browsers locally, install them too:

```bash
npx playwright install firefox
npx playwright install webkit
```

---

## 3. Understand the project layout

```text
playwright-ts-cucumber-framework/
├── config/                   Playwright and alternate Cucumber configuration
├── data/
│   ├── envData/              Encrypted environment URL configuration
│   └── userData/             Encrypted test user data
├── docs/
│   └── agentic-testing.md    AI agentic layer guide
├── src/
│   ├── agentic/              AI agentic layer (contracts, core, adapters, integrations)
│   ├── features/             Gherkin scenarios (.feature files)
│   ├── pages/                Page objects and POManager
│   └── steps/                TypeScript step definitions
├── support/
│   ├── hooks.ts              Browser and scenario lifecycle
│   ├── agentic-runtime.ts    Ollama diagnosis and locator selection
│   └── locator-recovery.ts   Self-healing approval and report attachment
├── utils/                    Shared browser, environment, and data helpers
│   └── scripts/              Encryption, decryption, and report scripts
├── .github/workflows/        GitHub Actions CI workflow
├── .env.example              Environment variable template (copy to .env)
├── cucumber.json             Active Cucumber CLI configuration
├── tsconfig.json             TypeScript compiler settings
└── package.json              npm scripts and dependencies
```

> `npm run cucumber` uses `cucumber.json` — it loads `support/hooks.ts` and all `src/steps/**/*.ts`, then runs all features under `src/features/**/*.feature`.
> GitHub Actions uses `cucumber.ci.json`, which omits `paths`; Cucumber v13 merges CLI paths with configured paths, so the default glob would otherwise cause every shard to run every feature.

---

## Configuration files: why they exist and how to use them

| File | Purpose | Active? |
|---|---|---|
| `cucumber.json` | Cucumber hooks, steps, feature paths, TypeScript support, report formatters | ✅ Yes — used by `npm run cucumber` |
| `cucumber.ci.json` | Cucumber runtime and reporters without a default feature glob, so CI shard paths run alone | ✅ Yes — used by GitHub Actions |
| `config/cucumber.config.ts` | TypeScript-formatted alternative Cucumber config | ❌ No — not wired into npm scripts |
| `config/playwright.config.ts` | Settings for the native Playwright Test runner | ❌ No — current scripts use Cucumber |
| `support/hooks.ts` | Browser launch/teardown, tracing, failure artifacts | ✅ Yes — loaded by both Cucumber configs |
| `tsconfig.json` | Strict type checking, ES2020 target, CommonJS output | ✅ Yes — used by TypeScript and `ts-node` |

### `cucumber.json` — active Cucumber setup

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
    "formatOptions": { "resultsDir": "test-results/allure-results" },
    "paths": ["src/features/**/*.feature"]
  }
}
```

### Runtime environment variables

| Variable | Used by | Default |
|---|---|---|
| `BROWSER` | Cucumber hooks | `chromium` (supports `firefox`, `webkit`) |
| `HEADLESS` | Cucumber hooks + Playwright config | `true`; set `false` for headed mode |
| `TIMEOUT` | Cucumber hooks + Playwright config | Cucumber: 60,000 ms · Playwright Test: 30,000 ms |
| `ENV_SECRET` | URL encryption/decryption | Required |
| `USER_SECRET` | User-data encryption/decryption | Optional; falls back to `ENV_SECRET` |

Example — override for a single run:

```bash
BROWSER=firefox HEADLESS=false TIMEOUT=90000 npm run cucumber
```

---

## 4. Configure test URLs and credentials

Sensitive data lives in encrypted files. Set `ENV_SECRET` in a local `.env` (copy from `.env.example`):

```dotenv
ENV_SECRET=your-private-encryption-secret
```

> `.gitignore` excludes `.env` and all decrypted JSON files. **Never commit secrets.**

### Environment URL file

Plaintext: `data/envData/envUrls.json`

```json
{
  "baseUrl": "https://your-test-site.example",
  "loginPath": "/web/index.php/auth/login",
  "searchPath": "/web/index.php"
}
```

### Encrypt / Decrypt environment URLs

```bash
# Create / update the encrypted file (removes plaintext after encrypting)
npm run encrypt-env

# Write a plaintext copy for local editing (encrypt again when done)
npm run decrypt-env
```

### Encrypt / Decrypt user data

Plaintext: `data/userData/userData.json`

```json
[{ "UserId": 1, "UserName": "example-user", "UserPassword": "replace-me" }]
```

```bash
npm run encrypt-user-data   # writes .enc file and removes plaintext
npm run decrypt-user-data   # writes plaintext for editing
```

### CI secret setup

Add `ENV_SECRET` under **GitHub → Settings → Secrets and variables → Actions**.
If user data uses a separate `USER_SECRET`, add that too.

---

## 5. Understand the Cucumber hooks

`support/hooks.ts` manages the full browser and scenario lifecycle:

| Hook | Runs | What it does |
|---|---|---|
| `BeforeAll` | Once before the suite | Decrypts URL config, launches browser |
| `Before` | Before each scenario | Creates browser context + page, starts tracing, creates `POManager` |
| `BeforeStep` | Before each step | Logs step start |
| `AfterStep` | After each step | Logs pass/fail; on failure triggers Ollama diagnosis (if enabled) |
| `After` | After each scenario | Attaches screenshot + trace on failure, closes page and context |
| `AfterAll` | Once after the suite | Closes the shared browser |

```typescript
// Simplified view — see support/hooks.ts for full logic
BeforeAll(async function () {
  await decryptEnvFile();
  globalBrowser = await chromium.launch({ headless: true });
});

Before(async function () {
  this.context = await globalBrowser.newContext();
  this.page    = await this.context.newPage();
  this.pageManager = new POManager(this.page);
});
```

---

## 6. Add a feature in Gherkin

Create a `.feature` file under `src/features/`:

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

> Use `@smoke` / `@regression` tags to run subsets. Use `Scenario Outline` + `Examples` for data-driven tests.

---

## 7. Implement steps and page objects

**Step definition** (`src/steps/`):

```typescript
When('the user enters username {string}', async function (username: string): Promise<void> {
  const loginPage = this.pageManager.getLoginPage();
  await loginPage.enterUsername(username);
});
```

**Page object** (`src/pages/`):

```typescript
this.usernameInput = page.locator('input[name="username"]');

public async enterUsername(username: string): Promise<void> {
  await this.usernameInput.fill(username);
}
```

> Register every new page object as a getter in `src/pages/POManager.ts`.

---

## 8. Run tests

```bash
# Run the full suite
npm run cucumber

# Run by tag
npm run smoke
npm run regression
npm run cucumber -- --tags "@login and @smoke"

# Browser and display options
BROWSER=firefox npm run cucumber
HEADLESS=false npm run cucumber
TIMEOUT=90000 npm run cucumber
```

---

## 9. Review reports and failure artifacts

After a run, these files are generated:

| Output | Path |
|---|---|
| Cucumber HTML report | `test-results/reports/cucumber-report.html` |
| Cucumber JSON report | `test-results/reports/cucumber-report.json` |
| Allure results | `test-results/allure-results/` |
| Allure HTML report | `test-results/allure-report/` (via `npm run allure:generate`) |
| Extended HTML report | `test-results/reports/cucumber-extended-report.html` (via `npm run report`) |

```bash
# Generate and open Allure report
npm run allure:generate
npm run allure:open
```

> Failed scenarios automatically attach: **error message · screenshot · Playwright trace**.
> When agentic is enabled, an `AGENTIC FAILURE ANALYSIS` block is also attached.
> A normal Cucumber run clears previous report files first. The cross-browser script preserves raw Allure results between its browser runs.

---

## 10. Agentic AI Testing (Ollama)

An opt-in AI layer uses a **local Ollama model** for:
- **Failure diagnosis** — brief advisory analysis attached to the Cucumber report
- **Locator self-healing** — suggests a replacement locator from visible page controls when a step fails

> This is **supplementary only** — it never changes Cucumber pass/fail results.
> See [`docs/agentic-testing.md`](docs/agentic-testing.md) for full details, flow diagram, and safety limits.

### Quick setup

**Step 1 — Install and start Ollama:**

```bash
brew services start ollama      # macOS Homebrew
# or: ollama serve              # in a separate terminal
```

**Step 2 — Pull the model:**

```bash
ollama pull qwen3:4b
```

**Step 3 — Verify Ollama is running:**

```bash
curl --fail http://127.0.0.1:11434/api/tags
ollama list                     # confirm qwen3:4b is listed
ollama run qwen3:4b "Reply with OK"
```

**Step 4 — Enable in `.env`:**

```env
AGENTIC_TESTS_ENABLED=true
AGENTIC_SELF_HEALING_ENABLED=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
```

**Step 5 — Run:**

```bash
npm run cucumber
```

### What is and is not implemented

| Capability | Status |
|---|---|
| Failure diagnosis | ✅ Active — Ollama receives a bounded summary; output is advisory only |
| Locator self-healing | ✅ Active — Ollama picks from discovered candidates; requires approval before one retry |
| Skills / Rules / Memory | 🔧 Foundations built — not yet wired into the Cucumber runtime |
| Test generation / auto-repair | 🔮 Future work |

---

## 11. Continuous integration

The workflow at `.github/workflows/e2e-tests.yml` runs smoke tests on **pull requests** using Chromium. For a manual dispatch, choose the suite (smoke, regression, or all), browser (including cross-browser), and shard count.

The workflow first installs dependencies and warms the npm cache, then starts the browser/shard test matrix. Each matrix runner still runs `npm ci` on its own VM because GitHub jobs do not share `node_modules`. Job names show the suite and shard position; each job also lists its assigned feature files in the Actions log and job summary. PRs currently create three Chromium shard jobs. The aggregate job combines the results and uploads separate `cucumber-report` and `allure-report` artifacts.

> Add `ENV_SECRET` as a GitHub Actions repository secret before enabling CI.

---

## 12. Add or change framework behavior

Follow this layer order when making changes:

1. Add / update the Gherkin scenario in `src/features/`
2. Add / update step definitions in `src/steps/`
3. Implement browser actions in a page object in `src/pages/`
4. Register new page objects in `src/pages/POManager.ts`
5. Add shared setup/teardown in `support/hooks.ts` only if needed
6. **Update this README** when commands, config, reports, or workflow behavior changes
7. Run the smallest relevant test locally and check the report

> Never commit decrypted test data or secrets.

---

## 13. Common Git commands

```bash
git status
git add <files>
git commit -m "feat: describe the change"
git push
```
