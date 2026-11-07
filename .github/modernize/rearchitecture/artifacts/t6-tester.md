# t6 — Runtime Validation: Legacy Behavior and Opt-In Foundation

**Generated:** 2026-11-07T07:06:46Z  
**Target:** `/Users/kakarlasubhan/playwright-ts-cucumber-framework`

## Summary

The deterministic agentic foundation and Cucumber lifecycle tests pass, and the complete TypeScript build and Cucumber CLI startup checks pass. The canonical `npm test` suite now runs 11 tests (previously 5), including explicit opt-in/default-off, runtime factory, policy/skill, memory isolation, and telemetry-failure cases.

The existing OrangeHRM browser scenarios were **not** executed: the Cucumber `BeforeAll` hook decrypts environment configuration and starts a browser against an external target. No approved target/credential environment was provided. Therefore the legacy login/dashboard journeys and real browser integration remain unverified. No production source, runner configuration, lockfile, or existing dirty file was changed.

## Changes Made

- Added `src/agentic/tests/orchestrator-guardrails.test.ts` to cover disallowed agent/skill execution, input validation, and per-run budget enforcement.
- Added `src/agentic/tests/cucumber-opt-in.test.ts` to cover disabled-by-default behavior, the unconfigured production runtime's fail-closed behavior, explicit fake-runtime initialization, one-shot supplementary diagnostics, and disposal.
- Added `src/agentic/tests/memory-telemetry.test.ts` to cover scenario memory isolation/clear and telemetry rejection isolation.
- Imported these suites from `src/agentic/tests/foundation.test.ts`, keeping all added tests reachable from the existing canonical `npm test` command without changing package/config files.

## Legacy Test Assets and Browser Journeys

- Existing browser E2E assets: `src/features/orengeHrmLogin.feature` and `src/features/DashboardMenu.feature`.
- No legacy Playwright `*.spec.ts` or other browser-test suite was found; `src/agentic/tests/foundation.test.ts` is the existing deterministic contract suite, not a legacy browser suite.
- Journeys declared in the feature files include login page/UI and field validation, positive/negative/mandatory-field login, forgot-password and keyboard flows, login security/accessibility attributes, dashboard menus/search, and hide-menu behavior.
- Decision: **reuse existing feature specifications without edits**; no browser suite was run because the configured hook decrypts test configuration and launches against a remote application. No feature or step changes were made.

## Environment and Startup

- Node.js: available, `v24.19.0`.
- Playwright CLI: available, version `1.59.1`; Playwright browser cache directories exist, but no browser test was started.
- Docker: unavailable; `docker` CLI was not found. Docker-based infrastructure is not required by the local framework contract tests.
- Application startup: not applicable. This repository is a test harness and defines no owned application server/readiness endpoint. Build and Cucumber CLI initialization were used as the safe startup checks.
- Cucumber environment decryption and feature execution were deliberately not invoked.

## Test Results

- Command: `npm test`
- Passed: 11
- Failed: 0
- Skipped: 0
- Exit code: 0
- Failure details: none.
- Command: `npm run build`
- Result: passed (`tsc --noEmit`), exit code 0.
- Command: `npm run cucumber -- --help`
- Result: passed, exit code 0; CLI help loaded without starting hooks.
- Command: `npm run cucumber -- --version`
- Result: passed; Cucumber `13.3.0`, exit code 0.
- Command: `git diff --check`
- Result: passed, exit code 0.

## Test Evidence and Verdict

```text
environment:
  docker: UNAVAILABLE — docker CLI not found; no container-backed infra is required by these tests
  node: AVAILABLE — v24.19.0
  playwright: AVAILABLE — CLI v1.59.1; browser caches present, not exercised
  infra-tier: NOT APPLICABLE — no database/service dependency in the tested foundation
  browser-tier: UNVERIFIED — Node and Playwright are available, but no approved external target/config was supplied
startup: PASS — full TypeScript build and safe Cucumber CLI initialization passed; no owned application server exists
integration: PASS — exit_code: 0, passed: 11, failed: 0, skipped: 0; in-process orchestrator, rules, skills, memory, telemetry, and Cucumber lifecycle; external adapters and real hook/browser integration remain gaps
e2e: UNVERIFIED — exit_code: n/a, passed: 0, failed: 0; declared login and dashboard browser flows were not run against the external OrangeHRM target; secret-backed hook startup is the boundary
overall: NEEDS_SIGNOFF — deterministic checks pass, but legacy browser journeys and actual opted-in external-provider integration remain unverified
```

## Open Findings and Risks

No new source defects were exposed by the added tests. The following unresolved source risks are documented in the upstream security audit and were not altered in this tester-owned task:

| Severity | Finding | Validation status |
|---|---|---|
| MEDIUM | `support/hooks.ts` globally sets `ignoreHTTPSErrors: true` although login scenarios submit credentials. | Not runtime-tested against the remote target; see t4 evidence. |
| MEDIUM | Raw step text and failure messages are logged before the optional diagnostic sanitizer runs. | Not runtime-tested; no external provider is active by default. |
| LOW | A custom telemetry sink that never settles may stall orchestration; this task verifies rejected telemetry only. | Hanging-sink behavior remains unverified. |
| LOW | Scenario memory is bounded per scope, not across the total number of scopes; expiry cleanup is lazy. | Scenario isolation/clear is tested; global scope limits are not present or tested. |

These are pre-existing findings, not regressions introduced by the test-only changes. Do not enable external provider/storage/telemetry adapters until the data-flow and resource-boundary concerns are addressed.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t4-security.md` — used security-boundary findings and positive controls to choose validation coverage and record unresolved risks.
- `.github/modernize/rearchitecture/artifacts/t5-architect.md` — used the baseline test/build results and confirmation that feature hooks decrypt environment configuration and start an external browser target.
- `.github/modernize/rearchitecture/clarification.md` — applied the requirements to preserve legacy behavior, keep AI explicit opt-in/provider-neutral, and avoid accessing secrets or unknown targets.

## Evidence Mapping

- `clarification.md#Generic` → no model/provider or test target was inferred; browser-backed feature execution was not performed without approved configuration.
- `t5-architect.md#Test Results` and `#Environment and Notes` → canonical build/test/CLI checks were rerun, with the Cucumber feature suite still withheld at the secret-backed external boundary.
- `t4-security.md#Boundary Assessment` → default-off runtime and diagnostic-only design informed opt-in/lifecycle tests.
- `t4-security.md#Additional Findings` and `#Boundary Assessment` → outstanding TLS, raw-log, telemetry-hang, and unbounded-scope concerns are listed above without attempting production fixes.
- `src/features/orengeHrmLogin.feature` and `src/features/DashboardMenu.feature` → identified the legacy user journeys that remain unverified by browser E2E.
