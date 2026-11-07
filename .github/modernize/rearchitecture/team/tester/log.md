## [t6] Validate legacy behavior and new opt-in framework flows
- The repo is a Playwright/Cucumber test harness, not a locally hosted application; the existing Cucumber `BeforeAll` decrypts environment configuration and starts a browser, so safe CLI checks do not prove external browser journeys.
- There were no legacy browser `*.spec.ts` tests; Gherkin feature files cover login and dashboard journeys. Kept them unchanged and documented E2E as unverified without an approved target.
- Added three test-only suites and imported them through the existing canonical foundation test entry point, avoiding package/config changes. `npm test` now passes 11 checks; full `npm run build` and safe Cucumber help/version checks also pass.
- Do not infer safety from provider-neutral interfaces: upstream t4 records open TLS verification, raw step/error logs, potentially blocking custom telemetry, and no global memory-scope cap. Tester changes did not address production code.
- Pre-existing worktree edits to `.github/modernize/rearchitecture/artifacts/project-profile.yaml` and `board.md` were preserved; `board.md` remained read-only.
- Learnings consumed: [architect/agentic-harness-smoke-validation, architect/agentic-testing-boundaries, backend/agentic-testing-foundation, security/agentic-data-boundaries, security/tls-validation-in-test-automation]
