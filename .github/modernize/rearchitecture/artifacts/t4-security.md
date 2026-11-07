# t4 — Security Boundary Audit

## Summary

The delegated security review returned one evidence-backed medium-severity finding: Playwright TLS certificate verification is disabled for every scenario, including login flows. The dependency remediation evidence reports zero known npm vulnerabilities. The delegated result did not provide line-level conclusions for the assigned provider, retrieval/RAG/vector-store, memory, or telemetry boundaries; the retry addendum below records direct source observations and distinguishes current adapters from future integration risks.

## Scope and Review Basis

- Reviewed the delegated security-review result for provider, retrieval, memory, telemetry, orchestration, and Playwright/Cucumber integration boundaries.
- Read the backend implementation summary and dependency remediation evidence, including the final scanner report and `npm audit` result.
- No source/config changes were made. The working tree already had unrelated edits to `artifacts/project-profile.yaml` and `board.md`; `board.md` was treated as read-only.
- This report does not claim that absence of reported findings proves the unreported boundary areas safe.

## Findings

### MEDIUM — TLS certificate verification disabled globally

- **Evidence:** `support/hooks.ts:55` sets `ignoreHTTPSErrors: true` on the scenario browser context. The security review also identified credential submission at `src/steps/loginSteps.ts:111-115`.
- **Impact:** A browser can accept an invalid/untrusted certificate for test traffic. Where a scenario submits credentials or handles authenticated session data, an on-path attacker able to intercept that connection may capture credentials or session data.
- **Recommended remediation:** Enable certificate validation by default. If a controlled test environment requires invalid certificates, make the exception explicit, narrowly scoped to approved targets, and unavailable as an implicit global default.
- **Responsible role:** Backend / Playwright-Cucumber integration owner.
- **Communication:** Sent to backend during this audit.

## Boundary Assessment and Limitations

- **Provider and implicit AI behavior:** The t2 backend artifact states that the runtime is disabled unless `AGENTIC_TESTS_ENABLED=true`, requires an explicitly configured runtime factory, and makes no outbound model calls by default. This is useful implementation evidence but is not a substitute for line-level verification of runtime enforcement.
- **Retrieval, RAG, knowledge base, vector store, and persistent memory:** The t2 artifact says no embedding, vector-database, or persistent-memory implementation was added. The delegated security-review result did not report a line-anchored assessment of the corresponding interfaces or future adapter trust boundaries.
- **Telemetry and data minimization:** The t2 artifact describes no remote telemetry dependency and warns that its basic observation redaction is not a guarantee against sensitive content. The delegated review did not return a line-anchored telemetry data-flow assessment. Before connecting any external provider/store/telemetry sink, enforce allowlisted minimal observations, secret/PII redaction, bounded retention and payload sizes, and best-effort failure isolation.
- **Agent authority:** Per the t1/t2 artifacts, agent execution is intended to be scenario-scoped and diagnostic-only, with no authority to alter test outcomes. These constraints should remain enforced when adapters are added; do not expose raw `Page`, full World, credentials, traces, or unfiltered artifacts.
- **Dependency CVEs:** `cve-fix-summary.md` records an empty final `appmod-cve-assessment` result and `npm audit --json` with 0 vulnerabilities. This audit relies on that recent t3 dependency scan rather than repeating it.
- **Coverage limitation:** The delegated security-review output contained the TLS finding only and no explicit conclusions for provider, retrieval/RAG/vector-store, memory, or telemetry code paths. Direct review of those paths is documented in the retry addendum below; adapter-specific controls remain unverified because those adapters are not implemented.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t3-backend.md` — dependency scan and remediation evidence index.
- `.github/modernize/rearchitecture/artifacts/cve-fix-summary.md` — final npm audit/scanner status and validation limitations.
- `.github/modernize/rearchitecture/artifacts/final-cve-report.json` — final scanner report (`[]`).
- `.github/modernize/rearchitecture/artifacts/t2-backend.md` — opt-in, provider-neutral implementation summary and redaction limitations.
- `.github/modernize/rearchitecture/clarification.md` — behavior-preservation, explicit opt-in, vendor-neutrality, and secret-protection requirements.
- `.github/modernize/rearchitecture/board.md` — task ownership/status context; read-only.

## Evidence Mapping

- `clarification.md#Generic` → provider-neutral, explicit-opt-in, secret-protection audit criteria; see boundary assessment and coverage limitation.
- `t2-backend.md#Implementation Notes` → documented default-off runtime and absence of outbound model calls; see provider assessment.
- `t2-backend.md#Findings and Limitations` → basic redaction warning and absence of production provider/storage/telemetry adapters; see retrieval/memory/telemetry limitations.
- Security-review result (`support/hooks.ts:55`, `src/steps/loginSteps.ts:111-115`) → MEDIUM TLS finding above.
- `cve-fix-summary.md#Scan Method and Evidence` and `final-cve-report.json` → dependency CVE status above.

## Verification

- Security-review agent invoked first for the audit and returned the finding above.
- Direct source inspection was performed on the retry for the agentic contracts, orchestrator, rules, skill registry, memory and telemetry adapters, Cucumber lifecycle, and existing hooks.
- `npm test` — passed 5, failed 0, skipped 0.
- `npm run build` — passed (`tsc --noEmit`).
- `npm audit --json` — 0 vulnerabilities across 141 resolved dependencies.
- No source changes were made. Browser-backed Cucumber scenarios were not run; t3 records that their hooks decrypt environment configuration and launch a browser against configured targets.
- No test failure is implied by the security finding; the browser-backed Cucumber scenarios were not run according to t3 evidence because they access encrypted environment configuration and configured browser targets.

## Retry Addendum — Direct Source Evidence

This addendum replaces the earlier retry draft's statement that provider/retrieval/memory/telemetry paths were wholly unverified. Their current contracts and local adapters were inspected directly. Provider, RAG, knowledge, vector-store, and remote telemetry implementations are still absent, so adapter-specific controls cannot be confirmed.

### Additional Findings

#### MEDIUM — Sensitive step and failure text can reach CI logs and an optional provider

- **Evidence:** `support/hooks.ts:109,117,122` logs raw Gherkin step text and, on failure, the raw first line of the exception before calling the diagnostic sanitizer at `support/hooks.ts:123`. `src/agentic/integrations/cucumber/lifecycle.ts:40-44,74-80` applies a bounded regex filter to the values passed to the optional runtime; the filter handles selected key/value labels, bearer tokens, query parameters, and email addresses, but cannot guarantee removal of unlabeled secrets, arbitrary response data, or other sensitive values. `src/agentic/contracts/agent.ts:21` allows a configured agent to receive an optional provider, and `src/agentic/core/orchestrator.ts:68` passes the original request to `agent.plan`; the default `support/agentic-runtime.ts:3-11` remains a throwing placeholder, so no provider is active in the repository as shipped.
- **Impact:** Scenario-outline values or exception text containing secrets/PII may be retained in CI logs. If a custom runtime forwards the failure observation or task to an external provider, residual sensitive content may leave the test environment.
- **Recommended remediation:** Stop logging raw step/error values or sanitize before logging; replace heuristic redaction with explicit allowlisted/minimized diagnostic fields and test known secret formats before enabling any external sink. Keep the provider disabled until that boundary is reviewed.
- **Responsible role:** Backend / Playwright-Cucumber integration owner.
- **Current exposure:** The default runtime makes no outbound provider calls; this is a real log-minimization issue and a conditional external-disclosure risk, not evidence of an active LLM integration.

#### LOW — Custom telemetry sinks can stall orchestration indefinitely

- **Evidence:** `src/agentic/core/orchestrator.ts:51` awaits the `agent.started` telemetry emission before entering its timed `try` block; the later `emit` helper at `:147-166` catches rejection but has no deadline. The default `NoopTelemetrySink` performs no I/O, but `OrchestratorDependencies.telemetry` accepts any injected sink.
- **Impact:** A custom sink whose promise never settles can prevent the agent call from starting or completing. The current no-op adapter is safe, but the interface does not itself enforce the documented best-effort property for future sinks.
- **Recommended remediation:** Put a bounded timeout around telemetry emission and keep sink execution detached or otherwise failure-isolated from the test-critical path; test both rejected and never-resolving sinks.
- **Responsible role:** Backend / agentic runtime owner.

#### LOW — Scenario memory is bounded per scope, not globally, and expiry cleanup is lazy

- **Evidence:** `src/agentic/adapters/memory/scenario-memory-store.ts:19-21` sets per-scope entry/value limits, but `:37-45` creates a map for each previously unseen scope and imposes no total scope/key budget. Expired entries are removed only when that exact key is read (`:25-31`); `write` does not prune expired entries before enforcing the per-scope limit (`:43-45`).
- **Impact:** A long-lived runtime using unbounded scope IDs can grow memory without bound, and stale entries can continue consuming a scope's capacity until individually read or cleared.
- **Recommended remediation:** Add total scope/key/value budgets and prune expired entries during writes or scheduled cleanup; ensure scenario/run scopes are cleared on disposal. Keep persistent or shared memory behind adapters with explicit tenant isolation, retention, and encryption.
- **Responsible role:** Backend / memory adapter owner.

### Boundary Assessment

- **Positive controls verified:** `support/hooks.ts:50` activates the runtime only when `AGENTIC_TESTS_ENABLED` equals `true`; `support/agentic-runtime.ts:3-11` is a placeholder that fails closed. `AgentOrchestrator` checks agent/skill allowlists, declared effects, input sizes, deadlines, cancellation, and validates skill inputs/outputs. The Cucumber diagnostic path is one-shot, bounded to 3 seconds, returns no diagnosis on timeout/error, and only attaches supplementary diagnostic text; it does not change scenario status.
- **Provider:** The provider is an interface only (`src/agentic/contracts/provider.ts:1-21`) and is not configured in the default runtime. The interface accepts arbitrary message text; data minimization is therefore a caller/adapter responsibility rather than an enforced provider boundary.
- **Retrieval/RAG/vector store:** These are contracts only (`src/agentic/contracts/rag.ts:1-18`, `knowledge.ts`, `vector-store.ts:1-23`). No retrieval, embedding, or vector database implementation is present. Namespace values and tenant/access policy are delegated to adapters, so isolation and prompt-injection handling must be verified before an adapter is connected.
- **Memory:** The included implementation is in-process and non-persistent; the per-scope bounds and TTL reduce exposure but do not provide a global resource cap or automatic lifecycle cleanup (finding above).
- **Telemetry:** The only included sink is a no-op adapter (`src/agentic/adapters/telemetry/noop-telemetry-sink.ts:1-8`). Event fields are limited to agent/run/scenario identifiers, event name, timestamp, skill ID, and duration, with no task, prompt, or output content. Do not treat a future custom sink as safe without reviewing destination, access control, retention, and failure isolation.
- **Authority boundary:** Agents select registered skills; rules validate allowlisted agent/skill IDs and declared side effects before execution. These declarations are not a sandbox for skill code: only register trusted application-owned implementations, and do not expose credentials, raw `Page`, full World, or unrestricted filesystem/network tools.
- **Dependencies:** The current `npm audit` and t3 scanner evidence are clean; this is a point-in-time known-advisory result, not a guarantee against future advisories.
