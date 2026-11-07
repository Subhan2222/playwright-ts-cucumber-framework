# Canonical Agentic Test Suites

For this TypeScript framework, split deterministic agentic contract tests by boundary while importing each suite from the existing canonical test entry point.

## What Happened

For `t6` in `playwright-ts-cucumber-framework`, the canonical command ran one foundation test file. Additional orchestration-guardrail, Cucumber opt-in, and memory/telemetry tests were added as distinct files and imported from that entry point, so `npm test` exercised all suites without changing package configuration.

## Takeaway

Keep test files focused by runtime boundary, but ensure the repository's existing canonical test command reaches every added suite. Treat browser-backed Cucumber features as a separate validation tier; CLI or contract tests do not prove remote target behavior.

## History
- 2026-11-07 (`playwright-ts-cucumber-framework/t6`): initial
