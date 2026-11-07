## [t1] Map agentic testing integration boundaries
- The current Cucumber hooks share one process-level browser but create a fresh context, page, and POManager for each scenario; agent runtime and default memory should therefore be World/scenario-scoped.
- Existing credentials and environment configuration have decrypt/load paths and process caches. Keep them out of provider prompts, memory, RAG indexing, and telemetry; do not inspect decrypted or secret files.
- The Cucumber runtime has both `cucumber.json` and `config/cucumber.config.ts`; verify effective config before changing runner wiring. `npm test` is a placeholder failure, while `npm run cucumber` is the established feature runner.
- The recommended integration is disabled-by-default and diagnostic-only, routed through a narrow adapter from existing hooks; agent output must not alter assertions or Cucumber pass/fail.
- No source code was changed; the architecture artifact is `.github/modernize/rearchitecture/artifacts/t1-architect.md`.
- Learnings consumed: none.

## [t5] Smoke-test build and runner startup
- Current `package.json` now defines `npm test` as the agentic foundation test suite (5 passed); the t1 note about it being a placeholder describes an earlier state.
- `npm ci`, root `npm run build`, `npm test`, Cucumber CLI help/version, and `npm ls` passed. npm 12 reported the optional `fsevents` install script as blocked by `allowScripts`, without failing installation.
- This repository has no hosted app/server port. Do not equate the Cucumber CLI startup with application HTTP startup; the configured `BeforeAll` decrypts environment config and launches a browser, so feature scenarios require the approved test environment.
- Pre-existing edits to `artifacts/project-profile.yaml` and `board.md` were left untouched; no source or dependency manifest changes were made.
- Learnings consumed: [architect/agentic-testing-boundaries, backend/agentic-testing-foundation, backend/npm-transitive-overrides].
