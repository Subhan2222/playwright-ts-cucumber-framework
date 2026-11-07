## [t1] Map agentic testing integration boundaries
- The current Cucumber hooks share one process-level browser but create a fresh context, page, and POManager for each scenario; agent runtime and default memory should therefore be World/scenario-scoped.
- Existing credentials and environment configuration have decrypt/load paths and process caches. Keep them out of provider prompts, memory, RAG indexing, and telemetry; do not inspect decrypted or secret files.
- The Cucumber runtime has both `cucumber.json` and `config/cucumber.config.ts`; verify effective config before changing runner wiring. `npm test` is a placeholder failure, while `npm run cucumber` is the established feature runner.
- The recommended integration is disabled-by-default and diagnostic-only, routed through a narrow adapter from existing hooks; agent output must not alter assertions or Cucumber pass/fail.
- No source code was changed; the architecture artifact is `.github/modernize/rearchitecture/artifacts/t1-architect.md`.
- Learnings consumed: none.
