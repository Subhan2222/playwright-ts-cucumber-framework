# t5 — Build and Startup Smoke Test

## Summary

The locked dependency install, complete TypeScript build, current primary test command, and Cucumber CLI startup all passed. This repository is a test automation framework, not a hosted web application: it has no application `start` script, server listener, readiness URL, or owned HTTP port to probe. Cucumber feature execution was not started because its `BeforeAll` hook decrypts environment configuration and launches a browser against externally configured targets.

## Smoke Test Verdict
- install_command: `npm ci`
- install_returncode: 0
- build_command: `npm run build`
- returncode: 0
- covers_all_modules: yes
- startup_http_status: n/a
- test_script_present: yes
- test_returncode: 0

## Test Results

- `npm ci` — passed, exit 0; installed 141 packages and found 0 vulnerabilities across 142 audited packages.
- `npm run build` — passed, exit 0 (`tsc --noEmit`).
- `npm test` — passed: 5, failed: 0, skipped: 0; exit 0.
- `npm run cucumber -- --help` — passed, exit 0; Cucumber CLI help resolves.
- `/usr/bin/time -p npm run cucumber -- --version` — passed, exit 0; Cucumber 13.3.0 CLI startup took 0.31 seconds.
- `npm ls` — passed, exit 0; dependency tree resolved without reported invalid or missing dependencies.
- Required npm script check — passed; both `build` and `test` scripts are present.
- Cucumber feature/browser scenarios — not run. The configured `support/hooks.ts` `BeforeAll` calls `decryptEnvFile()` and starts a browser; no scenario run was attempted without the approved external test environment and secret configuration.
- HTTP application startup — not applicable to this repository. No server start command, listener, readiness endpoint, or application port is defined. The CLI timing above measures only the test runner process, not an application server.

## Environment and Notes

- Node.js: `v24.19.0`; npm: `12.0.2`.
- Build plugin failures: none; no build plugins are configured.
- `npm ci` emitted a non-fatal npm 12 notice that the optional `fsevents@2.3.2` install script was blocked because it is not covered by `allowScripts`; installation still exited 0.
- No peer/dependency resolution conflict was reported by `npm ls`.
- No source, package manifest, or lockfile changes were made by this smoke test. The pre-existing worktree modifications to `artifacts/project-profile.yaml` and `board.md` were preserved.
- HTTP status and application startup time are n/a because this repo is a test harness; the configured application under test is external.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t3-backend.md` — followed its current package validation context and avoided running the environment-backed Cucumber scenario suite.
- `.github/modernize/rearchitecture/clarification.md` — treated the project as a test automation framework rather than an application server and preserved behavior/secret boundaries.

## Evidence Mapping

- `t3-backend.md#Test Results` / `#Follow-up and Limitations` → this report independently reruns frozen install, build, `npm test`, and safe Cucumber CLI startup; the browser-backed feature suite remains unrun.
- `clarification.md#Generic` → HTTP server startup is recorded as not applicable for this framework repository; no external target or secret was inferred or accessed.
