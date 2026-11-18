# playwright-ts-cucumber-framework
This repository contains a Behavior‑Driven Development (BDD) test automation framework built with Playwright, TypeScript, and Cucumber (Gherkin).

## Requirements
- Node.js 18.x or 20.x
- npm comes with Node.js
- `ENV_SECRET` must be set to decrypt `env.json`

## Recommended VS Code extensions
- `ESLint`
- `Prettier - Code formatter`
- `Cucumber (Gherkin) Full Support`
- `Playwright Test for VS Code`

## Setup
1. Clone the repo:
   - `git clone <repo-url>`
2. Go to the project folder:
   - `cd playwright-ts-cucumber-framework`
3. Install dependencies:
   - `npm install`
4. Run Cucumber tests:
   - `npm run cucumber`
5. Generate extended report:
   - `npm run report`

## Reports
- `npm run cucumber` creates:
  - `test-results/reports/cucumber-report.html`
  - `test-results/reports/cucumber-report.json`
  - `test-results/allure-results`
- `npm run report` creates:
  - `test-results/reports/cucumber-extended-report.html`
- Failed scenarios include an `AGENTIC FAILURE ANALYSIS` attachment with the diagnosis, model, failed step, and any provider error or timeout. Open the Cucumber HTML report, or run `npm run report` and inspect the extended report.
- Agentic locator recovery requires both `AGENTIC_TESTS_ENABLED=true` and `AGENTIC_SELF_HEALING_ENABLED=true`. Ollama selects from locally discovered candidates; the framework validates the choice and requires approval before a serial interactive retry. If approval is unavailable, such as in parallel workers, it attaches a proposal and keeps the scenario failed.

## Encrypted URL config
- `env.json` is the encrypted source file containing all URLs
- Use `npm run decrypt-env` before test execution to create `.tmp/env.decrypted.json`
- Tests read URLs from the decrypted file at `.tmp/env.decrypted.json`
- After execution, run `npm run cleanup-env` to remove the decrypted file
- Or use `npm run cucumber:secure` to decrypt, run tests, and clean up in one command
- Use `env.example.json` as the plain URL source and `npm run encrypt-env` to regenerate `env.json`

## Allure Reports
- `npm run allure:generate` creates:
  - `test-results/allure-report`
- `npm run allure:open` opens the Allure report in your browser

## Optional agentic testing foundation
- See [docs/agentic-testing.md](docs/agentic-testing.md) for the provider integration, opt-in Cucumber behavior, validation commands, roadmap, and safety limits.
- Failure diagnosis uses the local Ollama provider when `AGENTIC_TESTS_ENABLED=true`; it is supplementary and does not change Cucumber pass/fail results.
- Locator recovery additionally requires `AGENTIC_SELF_HEALING_ENABLED=true` and uses the configured local Ollama model for candidate selection; see [docs/agentic-testing.md](docs/agentic-testing.md) for its approval and retry limits.

### Run agentic tests locally
Install Ollama first. On macOS with Homebrew, start the Ollama service:

```sh
brew services start ollama
```

If you installed Ollama another way, start it with that installation's normal method. You can also run `ollama serve` in a separate terminal and leave that terminal open while testing.

Check that the Ollama API is responding:

```sh
curl --fail http://127.0.0.1:11434/api/tags
```

The command should return JSON containing a `models` list. If it cannot connect, Ollama is not running at that address.

Check whether the configured model is installed:

```sh
ollama list
```

Look for `qwen3:4b`. If it is not listed, download it once:

```sh
ollama pull qwen3:4b
```

Optionally check that the model can respond:

```sh
ollama run qwen3:4b "Reply with OK"
```

Make sure `.env` contains these settings:

```env
AGENTIC_TESTS_ENABLED=true
AGENTIC_SELF_HEALING_ENABLED=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
```

Check the settings loaded from `.env` without printing other environment values:

```sh
node -r dotenv/config -e 'console.log({
  agenticEnabled: process.env.AGENTIC_TESTS_ENABLED === "true",
  selfHealingEnabled: process.env.AGENTIC_SELF_HEALING_ENABLED === "true",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "(not set)",
  ollamaModel: process.env.OLLAMA_MODEL || "(not set)"
})'
```

Expect both flags to be `true`, the URL to be `http://127.0.0.1:11434`, and the model to be `qwen3:4b`. If a value is missing or incorrect, update `.env`.

Once Ollama is running, the model is installed, and the settings are correct, run:

```sh
npm run cucumber
```

Keep Ollama running while the tests execute. Locator recovery requires a serial interactive run so you can approve a suggested retry; without interactive approval, the suggestion is reported but the failed scenario remains failed.

## Environment
- `BROWSER` controls browser: `chromium`, `firefox`, or `webkit`
- `HEADLESS=false` runs browser in headed mode

## Basic Git commands
- `git status`
- `git add .`
- `git commit -m "message"`
- `git push`
- `git pull`
