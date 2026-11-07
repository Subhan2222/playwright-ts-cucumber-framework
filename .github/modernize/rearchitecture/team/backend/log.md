## [t2] Implemented typed agentic testing foundation
- Codebase/domain discoveries: Cucumber's existing failure trace hook used an unsupported Playwright `tracing.stop({ stdout: false })` form; switched to a temporary ZIP path, attach, and cleanup while preserving the failure artifact intent. The current Cucumber runner also decrypts environment config and launches a browser in `BeforeAll`, so scenario execution was avoided during this task.
- Wrong assumptions and corrections: the `npm test` script was a failing placeholder, while `npm run cucumber` is the established scenario runner. Added a focused `npm test` without replacing the Cucumber command.
- Debugging dead-ends and what actually worked: strict TypeScript surfaced the tracing API mismatch and generic variance in the typed skill registry; generic authorization plus a path-based trace attachment compiled cleanly.
- Techniques/patterns worth reusing: keep opt-in runtimes scenario-owned, inject provider adapters explicitly, authorize registered skills before execution, and send only bounded/redacted failure observations; use cooperative AbortSignals for bounded work.
- Learnings consumed: [architect/agentic-testing-boundaries]

## [t3] Remediated npm dependency CVEs
- Codebase/domain discoveries: `cucumber-html-reporter@7.2.0` pinned Cucumber 9.1.2 and uuid 3.x; the top-level Cucumber 12 graph was also vulnerable. Upgrading Cucumber to 13.3.0 and using the scanner-recommended reporter 5.0.2 removed the vulnerable graph, and the reporter's existing generation script still worked.
- Wrong assumptions and corrections: an initially clean appmod direct-manifest scan did not cover resolved transitive dependencies; pair it with the full-lockfile `npm audit`.
- Debugging dead-ends and what actually worked: compatible lockfile updates and a same-major semver override cleared earlier findings; changing Cucumber/reporter majors then removed remaining advisories. `npm test`, `npm run build`, the Cucumber CLI help, and `npm run report` passed.
- Techniques/patterns worth reusing: do not automatically defer major dependency changes when they are the only available security fix; scope them to the affected graph, verify package engine requirements, test existing consumer commands, and disclose any unrun environment-backed scenarios.
- Learnings consumed: [backend/agentic-testing-foundation]
