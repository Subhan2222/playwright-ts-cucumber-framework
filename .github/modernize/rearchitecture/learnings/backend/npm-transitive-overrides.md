# npm Transitive Overrides

Use root npm overrides for compatible same-major patches; when no compatible fix exists, test targeted major dependency changes against the existing test-runner and report workflows.

## What Happened

For `playwright-ts-cucumber-framework/t3`, `npm audit fix --ignore-scripts` patched brace-expansion and tmp but left a vulnerable nested semver 7.3.8. A root override kept semver on major 7. A first pass deferred Cucumber/glob/minimatch/uuid findings because npm's recommended changes crossed major versions; a later CVE-remediation pass upgraded Cucumber to 13.3.0, used cucumber-html-reporter 5.0.2 to remove its nested Cucumber 9 graph, and updated the semver override to 7.8.5. `npm test`, `npm run build`, Cucumber CLI help, report generation, appmod scan, and full `npm audit` then passed/cleared.

## Takeaway

Prefer npm's compatible lockfile fixes first. If a security fix requires a major boundary, verify runtime engine requirements, update only the affected dependency graph, and exercise the project's consumer commands (including report generation) before considering it resolved. Note any environment-backed suite that could not be run. Keep overrides targeted and within a compatible major when possible.

## History

- 2026-11-07 (`playwright-ts-cucumber-framework/t3`): initial
- 2026-11-07 (`playwright-ts-cucumber-framework/t3`): confirmed targeted Cucumber 13/reporter 5 migration clears the remaining audit findings when CLI, build, and report checks pass
