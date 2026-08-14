# playwright-ts-cucumber-framework
This repository contains a Behavior‑Driven Development (BDD) test automation framework built with Playwright, TypeScript, and Cucumber (Gherkin).

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

## Requirements
- Node.js 18.x or 20.x
- npm comes with Node.js
- `ENV_SECRET` must be set to decrypt `env.json`

## Recommended VS Code extensions
- `ESLint`
- `Prettier - Code formatter`
- `Cucumber (Gherkin) Full Support`
- `Playwright Test for VS Code`

## Reports
- `npm run cucumber` creates:
  - `test-results/reports/cucumber-report.html`
  - `test-results/reports/cucumber-report.json`
  - `test-results/allure-results`
- `npm run report` creates:
  - `test-results/reports/cucumber-extended-report.html`

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

## Environment
- `BROWSER` controls browser: `chromium`, `firefox`, or `webkit`
- `HEADLESS=false` runs browser in headed mode

## Basic Git commands
- `git status`
- `git add .`
- `git commit -m "message"`
- `git push`
- `git pull`
