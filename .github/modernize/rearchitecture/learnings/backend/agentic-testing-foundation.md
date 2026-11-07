# Agentic Testing Foundation

For safe Playwright/Cucumber agent integrations, keep typed policy and skill execution separate from provider adapters and attach runtime state to the scenario World only after explicit opt-in.

## What Happened

For `playwright-ts-cucumber-framework/t2`, the implementation added provider-neutral contracts and a default-deny orchestrator without selecting an LLM or storage vendor. Cucumber hooks now check `AGENTIC_TESTS_ENABLED` and require an explicit runtime factory; an unconfigured factory fails clearly only when opt-in is requested. Failure diagnosis is one-shot, bounded, and supplementary. TypeScript validation also exposed an existing invalid Playwright trace-stop call; writing a temporary trace ZIP retained the intended attachment behavior using the supported API.

For `playwright-ts-cucumber-framework/t7.1`, an opt-in POM bridge was added as a fixed read-only action union. The runtime factory receives only that facade (never the Page or POManager), and existing POM assertion methods were left unchanged; separate quiet observation methods avoid forwarding raw Playwright error text.

## Takeaway

Give agents only registered skill plans, enforce policies in orchestration, and pass scenario-scoped `AbortSignal`/minimal observations instead of Page, World, traces, or secrets. Keep telemetry best-effort and bounded. Reset per-run accounting when its owning runtime is disposed; configure external providers only in an explicit adapter.

For optional browser capabilities, expose framework-owned typed operations through a closure-backed facade, require a separate explicit action allowlist, and enforce limits before dispatch. Do not pass Playwright or manager objects into the runtime; use no-log observation methods and generic failure responses at the boundary.

For menu-hidden observations, use the known menu labels from the feature as the expected set, query hidden role links explicitly, and report hidden only when the complete set is present and every item is invisible. Reuse that same fail-closed observation in legacy assertions and optional capabilities so the two paths cannot disagree.

## History

- 2026-11-07 (`playwright-ts-cucumber-framework/t2`): initial
- 2026-11-07 (`playwright-ts-cucumber-framework/t7.1`): documented policy-checked read-only POM capability boundary
- 2026-11-07 (`playwright-ts-cucumber-framework/t7.3.1`): documented fail-closed menu-hidden observation semantics
