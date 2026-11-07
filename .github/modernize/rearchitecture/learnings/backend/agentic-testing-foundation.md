# Agentic Testing Foundation

For safe Playwright/Cucumber agent integrations, keep typed policy and skill execution separate from provider adapters and attach runtime state to the scenario World only after explicit opt-in.

## What Happened

For `playwright-ts-cucumber-framework/t2`, the implementation added provider-neutral contracts and a default-deny orchestrator without selecting an LLM or storage vendor. Cucumber hooks now check `AGENTIC_TESTS_ENABLED` and require an explicit runtime factory; an unconfigured factory fails clearly only when opt-in is requested. Failure diagnosis is one-shot, bounded, and supplementary. TypeScript validation also exposed an existing invalid Playwright trace-stop call; writing a temporary trace ZIP retained the intended attachment behavior using the supported API.

## Takeaway

Give agents only registered skill plans, enforce policies in orchestration, and pass scenario-scoped `AbortSignal`/minimal observations instead of Page, World, traces, or secrets. Keep telemetry best-effort and bounded. Reset per-run accounting when its owning runtime is disposed; configure external providers only in an explicit adapter.

## History

- 2026-11-07 (`playwright-ts-cucumber-framework/t2`): initial
