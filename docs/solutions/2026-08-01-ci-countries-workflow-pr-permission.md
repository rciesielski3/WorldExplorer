---
title: Monthly countries workflow cannot create pull requests
date: 2026-08-01
category: ci
symptoms:
  - "Update Countries Data" workflow (.github/workflows/update-countries.yml) fails on its monthly schedule
  - 'Error: GitHub Actions is not permitted to create or approve pull requests.'
root_cause: The repository setting "Allow GitHub Actions to create or approve pull requests" was off, so the pull-requests write permission in the workflow YAML was not enough.
fix: Enabled the repository setting through the GitHub API; verified with a manual run that opened PR #46.
prevention: Keep the setting enabled; treat the monthly run as the regression check; scope permissions explicitly per workflow.
---

## Symptoms

The monthly dataset workflow failed at the step that opens the pull request with:

```
GitHub Actions is not permitted to create or approve pull requests.
```

It had already failed on 2026-07-01, so it would have failed every month a dataset change was detected.
Analysed run: 30686438329.

## Root cause

GitHub requires two things for a workflow to create a pull request:

1. The workflow's `permissions` allow it. `update-countries.yml` already declares
   `contents: write` and `pull-requests: write`.
2. The repository setting Settings > Actions > General > Workflow permissions >
   "Allow GitHub Actions to create or approve pull requests" is on.

The second condition was missing (API: `can_approve_pull_request_reviews: false`, the default for the repo).
The YAML was correct; the failure was in repository configuration, not in code.

## Fix

Changed the repository workflow permissions through the API:

```bash
gh api --method PUT repos/rciesielski3/WorldExplorer/actions/permissions/workflow \
  -F default_workflow_permissions='write' \
  -F can_approve_pull_request_reviews=true
```

Result: `default_workflow_permissions` read -> write, `can_approve_pull_request_reviews` false -> true.

Verification: manual trigger, run 30694020570, completed successfully and created PR #46
("chore: monthly countries dataset update").

Review note: only `can_approve_pull_request_reviews=true` is required. Raising the default workflow
permission to `write` is broader than needed because this workflow declares its own permissions; consider
reverting it to `read` and giving other workflows (for example `pr-validate.yml`) an explicit `permissions:`
block. The setting is repo-wide, so it also applies to every other workflow.

## Prevention

- Keep both gates in mind when a workflow that opens pull requests fails with a permission error: YAML
  `permissions` and the repository setting.
- A scheduled workflow is an effective regression detector; the next scheduled run (first of the month)
  confirms the fix, and a manual `workflow_dispatch` run can confirm it any time.
- Prefer explicit `permissions:` per workflow over a broad repository default.
- Repository settings changes do not appear in the diff: record them in `docs/solutions/` like this entry.

## References

- Workflow: `.github/workflows/update-countries.yml`
- Failed run 30686438329, verifying run 30694020570, resulting PR #46
