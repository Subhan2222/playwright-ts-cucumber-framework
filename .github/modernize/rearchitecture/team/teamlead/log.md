## [t7] Verify agentic foundation conformance evidence
- Codebase/domain discoveries: deterministic Node tests cover the agentic policy and lifecycle contract, but the original browser scenarios require decryption and an external application target; a green contract suite does not establish legacy browser equivalence.
- Wrong assumptions and corrections: the repository does not include the expected context/decisions files or a formal plan/constitution. Treat the direct task assignment and clarification/architecture artifacts as available requirements; do not infer missing checkpoints pass.
- Debugging dead-ends and what actually worked: no source changes were needed; direct evidence from t5/t6 plus a fresh `npm test`, `npm run build`, and `git diff --check` established deterministic/build status without decrypting secrets or starting a browser.
- Techniques/patterns worth reusing: separate full-build evidence from scenario-level evidence; record unexecuted external E2E as unverified, not passed or failed; preserve dirty worktree artifacts.
- Learnings consumed: []
