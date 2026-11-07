# Agentic testing foundation

This repository remains a Playwright + TypeScript + Cucumber framework. The agentic layer is additive, scenario-scoped, provider-neutral, and disabled by default. Existing Cucumber steps, assertions, browser lifecycle, and reports remain authoritative.

## Structure and relationships

```text
src/agentic/
  contracts/       Agent, skill, policy, provider, memory, knowledge/RAG, vector, telemetry, run context
  core/            Agent/skill registries, policy checks, orchestrator
  adapters/        Ephemeral scenario memory and no-op telemetry
  integrations/
    cucumber/      Typed World extension, lifecycle and failure observation boundary
  tests/           Focused deterministic contract tests
support/
  hooks.ts         Existing browser hooks; bounded failure-only diagnostic seam
  agentic-runtime.ts  Explicit runtime factory to configure before enabling
```

`AgentOrchestrator` asks a registered `Agent` for a plan, checks the agent and registered `SkillDefinition` against `RulesEngine`, validates input/output, and enforces per-run call, input, deadline, timeout, and cooperative cancellation limits. The owner should call `resetRun(runId)` when its scenario/runtime is disposed so the in-memory call ledger remains bounded. A skill is executable framework code with declared side effects; model output cannot define or grant itself tools. `ModelProvider`, `MemoryStore`, `KnowledgeRetriever`/`KnowledgeSource`, `EmbeddingProvider`, `RagPipeline`, `VectorStore`, and `TelemetrySink` are interfaces only. The included memory adapter is bounded, TTL-based and process-local; telemetry defaults to a no-op sink.

## Integration and workflow

1. Keep `AGENTIC_TESTS_ENABLED` unset or set to anything except `true` for the unchanged Cucumber path. In this mode no runtime factory is invoked.
2. To opt in, implement `support/agentic-runtime.ts` with explicitly selected agents, registered skills, strict rules and approved adapters. Then set `AGENTIC_TESTS_ENABLED=true`. The provided placeholder deliberately fails clearly if enabled before a runtime has been configured.
3. Hooks create and dispose a runtime per scenario. On the first failed step only, the runtime can receive a bounded, best-effort observation with basic credential/query/email redaction. Its output is attached as supplementary text; the hook catches diagnostic/attachment failures and never changes step assertions or scenario status.
4. Run `npm run build` and `npm test` for contract checks; continue to use `npm run cucumber` for the existing scenario runner.

No raw `Page`, `BrowserContext`, POManager, trace, screenshot, credential, or complete Cucumber World is passed to the runtime. A future UI capability should expose narrow, policy-checked POM operations rather than Playwright directly.

## Roadmap and production considerations

- **Current increment:** deterministic contracts, registries, policy enforcement, opt-in Cucumber seam, bounded ephemeral memory, no-op telemetry, and tests.
- **Next:** add reviewed read-only diagnostic skills and fake-provider lifecycle tests; keep diagnosis optional and bounded.
- **Later, explicit integrations:** choose a model, embedding, vector, persistent-memory, or telemetry adapter only after privacy, credentials, tenant isolation, retention/deletion, and spend controls are approved.

External adapters are not dependencies in this increment. For scale, use isolated scenario/run namespaces, bounded concurrency, request timeouts, cancellation, quotas, backpressure, circuit breakers, and retention controls; persistent stores require tenant ACLs and encryption. Apply redaction/minimization before any external boundary and do not index test results by default. Keep provider credentials outside source control. Agent recommendations remain advisory: no autonomous test mutations, retries, locator invention, shell/filesystem access, or pass/fail authority.

## Known limitations

- No LLM, embedding, vector database, persistent memory, or remote telemetry implementation is included.
- Failure-observation redaction is a basic safety filter, not a guarantee against sensitive content. Review data policy and strengthen sanitization before enabling any external provider.
- The default runtime factory is intentionally unconfigured; enabling the environment flag alone throws instead of silently selecting a vendor.
- The focused `npm test` suite checks the new deterministic contracts; it does not replace scenario execution, which remains `npm run cucumber`.
