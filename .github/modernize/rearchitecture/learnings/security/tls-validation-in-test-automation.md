# TLS Validation in Test Automation

Browser test contexts that submit credentials should validate server certificates by default; any test-only exception should be explicit and narrowly scoped.

## What Happened

For `playwright-ts-cucumber-framework/t4`, a delegated security review found `ignoreHTTPSErrors: true` applied globally to scenario contexts while a login step submitted credentials. This can allow invalid-certificate interception of test credentials or session data.

## Takeaway

Do not globally disable browser TLS validation to simplify test environments. Keep certificate checks on by default and constrain any necessary exception to approved test targets; security reviews should distinguish a documented design intention from line-anchored verification of the actual boundary.

## History

- 2026-11-07 (`playwright-ts-cucumber-framework/t4`): initial
