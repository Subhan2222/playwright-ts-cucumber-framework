# Agentic Testing Boundaries

For this Playwright + Cucumber framework, integrate optional agent behavior through a typed Cucumber World/lifecycle adapter, not global state or direct step rewrites.

## What Happened

During `t1` in `playwright-ts-cucumber-framework`, inspection showed a process-wide Playwright browser with scenario-local contexts/pages/POManager, Cucumber failure artifact hooks, and existing encrypted configuration/credential loaders. The architectural choice is to make agent execution explicit and World-scoped, with diagnostic-only authority and a no-op/off default.

## Takeaway

Keep provider, memory, retrieval, vector-store, and telemetry implementations behind injected interfaces. Start with no-op/fake adapters and a read-only skill; never pass the raw Playwright `Page`, credentials, traces, screenshots, or full World to an agent by default. Agent output must not change test outcomes.

## History

- 2026-11-07 (`playwright-ts-cucumber-framework/t1`): initial
