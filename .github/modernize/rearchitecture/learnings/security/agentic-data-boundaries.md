# Agentic Data Boundaries

Provider-neutral interfaces and opt-in flags do not replace enforcement at every external data boundary.

## What Happened

During `playwright-ts-cucumber-framework/t4`, direct review found a default-off runtime placeholder and interface-only provider/RAG/vector adapters, while the existing Cucumber hooks still logged raw step/error text before a limited redactor. The in-memory adapter bounded entries per scope but not the number of scopes; custom telemetry could block orchestration by never resolving. Findings were verified in source, and the dependency tree had 0 advisories in the point-in-time `npm audit`.

## Takeaway

Before enabling an external agent/provider, minimize and allowlist diagnostic fields before logging or forwarding them; treat regex redaction as defense-in-depth only. Apply global resource budgets and eager expiry cleanup to memory, bound telemetry latency, and require each future retrieval/vector adapter to enforce tenant namespace/access policy. Keep default-off behavior and review adapter code rather than relying on interface names or documentation.

## History
- 2026-11-07 (`playwright-ts-cucumber-framework/t4`): initial
