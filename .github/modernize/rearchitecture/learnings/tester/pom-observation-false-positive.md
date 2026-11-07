# POM Observation False Positives

Deterministic POM bridge tests should compare the capability's observation target against the real feature's semantic UI target, not only verify that a method was dispatched.

## What Happened

In `playwright-ts-cucumber-framework` task t7.3, the new page-object capability routed `dashboard.verify-menu-hidden` to a count over a locator initialized with the literal accessible name `"menuOption"`, while the existing feature enumerates actual names such as Admin and PIM. A fake-page test showed the capability can report a visible Admin item and a hidden menu at the same time if that literal locator has no matches; no external DOM was used.

## Takeaway

When validating new read-only POM observations, assert the semantic target (selector/accessibility name) and state relationship, not merely the dispatcher output. Treat a test using an injected page/locator as contract evidence only; reserve real selector correctness for an approved browser-backed flow.

## History
- 2026-11-07 (`playwright-ts-cucumber-framework/t7.3`): initial
