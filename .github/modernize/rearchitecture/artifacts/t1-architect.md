# t1 — Existing Framework and Agentic Integration Boundaries

## Purpose and scope

This is the implementation-facing architecture map for adding agentic capabilities to the existing Playwright + TypeScript + Cucumber project. It records current runtime boundaries and the additive integration shape; it does not prescribe a vendor, authorize changes to existing test outcomes, or replace the current execution path.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` — confirms a single-package TypeScript/JavaScript framework and the requirement that current test execution remain the default.
- `.github/modernize/rearchitecture/clarification.md` — confirms provider neutrality, explicit AI opt-in, preservation of existing behavior, and protection of secrets.
- `.github/modernize/rearchitecture/board.md` — checked task ownership and phase dependencies; read-only.
- No dependency-task implementation artifacts were provided.

## Evidence Mapping

- `project-profile.yaml#project.structure` → existing module boundaries and the proposed additive `src/agentic/` package below.
- `clarification.md#Generic` → disabled-by-default integration, no required vendor, and no behavior change to legacy scenarios.
- `support/hooks.ts#Before/After/AfterStep` → scenario lifecycle integration points and failure-only diagnostic trigger.
- `support/hooks.ts#Before` + `src/pages/POManager.ts` → scenario-scoped `Page` and lazy page-object manager as the safe adapter boundary.
- `config/cucumber.config.ts` + `cucumber.json` → Cucumber loading/configuration boundary; both need to be accounted for during any hook integration.
- `src/steps/loginSteps.ts` + `utils/userCredentials.ts` + `utils/envConfig.ts` → sensitive test inputs/configuration must not be added to agent context, memory, knowledge, or telemetry.
- `package.json` + `tsconfig.json` → current dependency/runtime and strict TypeScript constraints for implementation.

## Current Architecture (observed)

**Project type:** single-package test automation framework (not a product backend or frontend).

| Layer / area | Existing location | Observed responsibility and boundary |
|---|---|---|
| Scenario specifications | `src/features/*.feature` | Gherkin login and dashboard scenarios, including tags such as smoke/regression. |
| Step bindings | `src/steps/*.ts` | Cucumber `Given`/`When`/`Then` definitions; use dynamic Cucumber World (`this`) and `pageManager` to reach UI code. |
| Page-object composition | `src/pages/POManager.ts` | Lazily constructs login/dashboard page objects for the current Playwright `Page`. |
| Page objects | `src/pages/loginPage.ts`, `src/pages/dashBoardPage.ts` | Encapsulate locators and browser actions/assertions; retain Playwright `Page` references. |
| Base/shared utilities | `utils/basePage.ts`, `utils/helpers.ts`, `utils/envConfig.ts`, `utils/userCredentials.ts` | Navigation, logging helper, environment configuration and credential loading/decryption. |
| Lifecycle and browser | `support/hooks.ts` | Starts one process-wide browser, creates a new context/page and `POManager` per scenario, records traces, and attaches screenshot/error/trace on failure. |
| Runner configuration | `cucumber.json`, `config/cucumber.config.ts`, `config/playwright.config.ts` | Cucumber registration/reporting and a separate Playwright Test config. The npm Cucumber command is the current scenario runner; confirm config-file discovery before changing configuration. |
| Data and output | `data/`, `.tmp/`, `test-results/` | Encrypted environment/user data, transient decrypted configuration, and Cucumber/Allure results. Do not ingest or export these by default. |

The existing hook creates a scenario-local `context`, `page`, and `pageManager`, while reusing `globalBrowser` across scenarios in the process. This makes the Cucumber World the correct owner for any scenario-specific agent runtime; module-level mutable agent/memory state would cross scenario boundaries.

## Recommended Additive Layout

Keep all new capability code out of hooks and page-object implementations except for a small adapter at the lifecycle boundary.

```text
src/agentic/
  contracts/
    agent.ts                 Agent identity, request, response, run context
    skill.ts                 Typed skill metadata, input/output, allowed actions
    rules.ts                 Policy and execution constraints
    provider.ts              Provider-neutral model/client contract
    memory.ts                Scoped memory read/write contract
    knowledge.ts             Curated knowledge/retrieval contracts
    vector-store.ts          Provider-neutral vector index/search contract
    telemetry.ts             Structured, redacted event contract
    orchestration.ts         Run options, budget, cancellation, outcome contract
  core/
    orchestrator.ts          Coordinates policy, agent, skills, provider, stores
    skill-registry.ts        Resolves explicitly registered skills
    rules-engine.ts          Evaluates allow/deny and data-handling constraints
  integrations/cucumber/
    world.ts                 Typed World extension with optional runtime
    lifecycle.ts             Narrow adapter called by existing hooks
  adapters/
    provider/                Optional provider implementations (none required)
    memory/                  In-memory scenario store; optional persistent adapter
    knowledge/               Local source + retrieval adapter
    vector-store/            Optional backend adapter
    telemetry/               No-op/local/remote sink adapters
```

Use the repository's existing `src/` layout and strict TypeScript configuration. Treat the names above as proposed module boundaries, not a demand to add empty files for every interface in the first increment.

## Typed Relationships

```text
Cucumber hook
  └─ typed ScenarioWorld.agentRuntime? (absent by default)
       └─ CucumberLifecycleAdapter
            └─ AgentOrchestrator
                 ├─ RulesEngine ── authorizes skill and data access
                 ├─ SkillRegistry ── resolves typed SkillDefinition
                 ├─ Agent ── selects a registered skill; no raw browser access
                 ├─ ModelProvider ── optional, injected implementation
                 ├─ MemoryStore ── scenario-scoped by default
                 ├─ KnowledgeRetriever ── curated documents only
                 │    ├─ KnowledgeSource
                 │    ├─ EmbeddingProvider? (optional)
                 │    └─ VectorStore? (optional)
                 └─ TelemetrySink ── no-op by default; redacted events only
```

Contracts to establish before implementing adapters:

- **Agent / orchestration:** input contains an explicit task, allowlisted capabilities, correlation identifiers, deadline/token or cost budget, and cancellation signal. Result is a typed diagnostic/artifact; it cannot change Cucumber status, retry a step, or alter assertions.
- **Skill:** stable name/version, validated input and output types, explicit allowed tools, declared read/write side effects, and execution limits. A skill is executable code registered by the framework, not model-generated instructions granted authority.
- **Rules:** deny by default for undeclared tools/data; distinguish observe-only from mutating capabilities; enforce redaction, maximum calls, timeout, and opt-in policy centrally.
- **Provider:** a minimal provider-neutral request/response interface; implementation is dependency-injected. Do not add a vendor SDK or read API keys unless that adapter is explicitly enabled.
- **Memory:** `read`, `write`, and `clear` operations take an explicit scope. Default scope is one scenario/run, with bounded size and TTL. Persisted/cross-run memory needs explicit enablement, redaction, access control, and retention.
- **Knowledge/RAG/vector store:** keep `KnowledgeSource`, retrieval/ranking, embedding, and vector persistence separate. Local curated retrieval can exist without embeddings or a vector database. Namespace records by project/run/tenant as applicable; index creation and external retrieval are explicit operations.
- **Telemetry:** structured events pass through a redactor before any sink. The default sink is no-op or local-only and must not record prompts, secrets, credentials, raw DOM, screenshots, traces, or unfiltered step/error text.

## Cucumber, Hooks, and POM Integration Contract

1. Preserve the current Cucumber command, scenario discovery, browser/context lifecycle, POM behavior, hooks, and report outputs when agentic mode is off.
2. Introduce a typed `ScenarioWorld` (or equivalent type-only World contract) for `context`, `page`, `pageManager`, and optional `agentRuntime`; migrate `any` usage incrementally. Do not add a process-global runtime or share a scenario memory object.
3. Keep the existing hook responsible for browser resources. A small lifecycle adapter may initialize a runtime in the existing `Before` only when an explicit enable flag is true, and must dispose it from `After` on both success and failure.
4. On explicit opt-in, `AfterStep` may forward a sanitized, bounded failure observation to a diagnostic skill. The diagnostic is supplementary and must never suppress/change a failed result. Bound hook latency and skip diagnostics when the budget is exhausted.
5. Start with **read-only diagnosis**. Do not give the model the raw `Page`, unrestricted Playwright APIs, `page.evaluate`, shell/filesystem access, or credentials. If UI tools are later allowed, expose narrowly typed, policy-checked POM operations and explicitly separate read from mutation.
6. Preserve current trace/screenshot attachments as Cucumber artifacts. Do not include them in prompts, embeddings, memory, or telemetry without separate opt-in, sanitization, and retention controls.
7. Leave scenario step text and Gherkin behavior unchanged. Existing step definitions remain the source of truth for actions and assertions; agent output is annotation/diagnosis only.

Recommended configuration invariant: unset/false `AGENTIC_TESTS_ENABLED` means no runtime construction, provider initialization, outbound request, agent-specific storage, or added delay. If explicitly enabled but configuration/provider is incomplete, fail clearly (or skip only under an explicitly documented policy); never silently select a paid remote provider.

## Incremental Implementation Roadmap

1. **Contracts and safe defaults:** add typed interfaces, validation, a no-op provider/sink, deterministic fake implementations, and focused unit tests. Verify disabled mode has no side effects.
2. **Cucumber lifecycle adapter:** add typed World/runtime ownership and explicit opt-in wiring; keep browser and scenario cleanup in existing hooks. Add tests for off/on/failed-step/cleanup paths with a fake provider.
3. **Policy-bound skills:** define a small registry and read-only diagnostic skill, with schemas, allowlists, timeouts, call limits, and output attachment. Do not implement self-healing or assertion mutation.
4. **Knowledge and memory:** begin with curated local knowledge and ephemeral scenario memory. Add embedding/vector adapters only behind interfaces and optional dependencies after data handling and namespace policy are reviewed.
5. **Production adapters:** select a provider/store only through explicit configuration; add authentication, quotas, retry/circuit-breaker policy, privacy controls, operational metrics, and integration tests as a separate increment.

## Dependencies, Scalability, and Safety

- The contracts and fake/no-op implementations require no new runtime dependency. Keep external LLM, embedding, vector database, and remote telemetry SDKs optional and adapter-scoped.
- Use bounded concurrency, request timeouts, per-run budgets, cancellation, rate limits, and backpressure. Avoid retrying non-idempotent tools; do not make test completion wait indefinitely for diagnosis.
- For parallel workers, isolate runtime and memory by scenario/run and namespace any shared external store by project/tenant. Apply tenant ACLs, encryption in transit/at rest, retention/deletion policy, and auditable access before persistent storage.
- Treat environment values and user credentials as secrets. The repository has decryption/loading paths in `utils/envConfig.ts` and `utils/userCredentials.ts`; agent context must receive neither raw secrets nor credential-bearing values. Avoid serializing the World object, page, or full feature context.
- Existing screenshots/traces and step/error strings can contain sensitive page data. Redact before model or telemetry boundaries; keep artifacts local/retained under the existing reporting policy unless a separate user-approved export is configured.
- The default must be deterministic and offline. Agent output cannot determine pass/fail, invent locators, submit forms, change account state, or make network requests except via an explicitly selected provider.
- `package.json` currently has a placeholder `npm test` command that exits with failure; Cucumber feature execution is via `npm run cucumber`. Establish focused unit tests without weakening or replacing that existing runner. Do not treat a green TypeScript check as validation of scenario behavior.

## Risks and Mitigations (inline)

- **Lifecycle regression:** hook edits can affect every scenario. Keep integration in a narrow adapter, default off, and test normal and failure cleanup with fakes.
- **Cross-scenario leakage:** global browser is shared, but test context/page are per scenario. Store runtime and default memory only on the World; explicitly namespace shared stores.
- **Credential/data exfiltration:** encrypted config and user data are decrypted/cached by existing utilities. Provide only redacted, minimized diagnostic data and use no external provider by default.
- **Nondeterministic test outcomes or runaway spend:** prohibit agent pass/fail authority; enforce explicit opt-in, timeout, request limits, and budget before provider invocation.
- **Configuration ambiguity:** `cucumber.json` and `config/cucumber.config.ts` both exist. Preserve the effective current runner config and validate it before consolidating or relocating configuration.
- **Adapter lock-in:** no LLM, embedding, vector, or telemetry vendor is evidenced in this repository. Implement contracts and fakes first; select adapters only in a separately approved integration step.

## Validation Performed for This Analysis

- Inspected worktree status, project profile/clarification, package and Cucumber/TypeScript configuration, README, hooks, steps, page objects, configuration/credential utilities, and feature inventory.
- Did not read `.env`, encrypted data contents, or transient decrypted data.
- No source code was changed. No build, test, or runtime smoke test was run because this assignment produces an architecture artifact only; runtime validation remains with the implementation and later validation tasks.
- At inspection start, the only untracked files were the modernization run's `project-profile.yaml`, `board.md`, and `clarification.md`. They were preserved.
