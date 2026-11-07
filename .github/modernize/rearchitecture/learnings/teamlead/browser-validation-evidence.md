# Browser Validation Evidence

For secret-backed Cucumber suites targeting external applications, distinguish passing in-process contract tests from verified browser behavior and require an explicitly approved runtime environment.

## What Happened

In `playwright-ts-cucumber-framework` task t7, 11 deterministic agentic tests and the TypeScript build passed, but the login/dashboard browser journeys were not run because their `BeforeAll` hook decrypts configuration and launches an external target without an approved target/credential environment. The correct gate result was FAIL for missing legacy runtime evidence, not a claim that the tests failed.

## Takeaway

Keep external browser runs opt-in and authorized. Report exact scope/results as unverified when they were not run; do not substitute unit tests or CLI help/version checks for end-to-end evidence, and do not read secrets or probe unknown targets merely to close a gate.

## History
- 2026-11-07 (playwright-ts-cucumber-framework/t7): initial
