# Solutions

A small knowledge base of problems that were solved once and should be cheap to solve again.
Write an entry when a fix needed real investigation (CI, signing, store, native build, data pipeline),
while the context is fresh. Skip trivia.

## Layout

One file per problem: `docs/solutions/<YYYY-MM-DD>-<short-kebab-title>.md`. Add it to the index below.

## Template

Copy this block, fill every field, keep it factual. Do not paste secrets, keystore data, API keys, or
passwords; name the secret (for example `ANDROID_KEYSTORE_BASE64`), never its value.

```markdown
---
title: Short description of the problem
date: YYYY-MM-DD
category: ci | signing | build | runtime | store | data | other
symptoms:
  - Exact error message or observable behavior
root_cause: One or two sentences
fix: One or two sentences, with PR or commit reference
prevention: What stops this from recurring
---

## Symptoms
What was seen, where (workflow run, device, log line).

## Root cause
Why it happened. Mark anything inferred rather than verified.

## Fix
What changed, with the exact commands or diff summary.

## Prevention
Checks, tests, settings, or docs that guard against it.

## References
PRs, commits, runs, related files.
```

## Index

| Date | Category | Entry |
|------|----------|-------|
| 2026-08-01 | ci | [Monthly countries workflow cannot create pull requests](2026-08-01-ci-countries-workflow-pr-permission.md) |
| 2026-10-10 | signing | [CI release build ignored the upload keystore](2026-10-10-ci-keystore-signing-wiring.md) |
