# GitHub Actions Workflows

## Overview

One release workflow builds, verifies and (optionally) publishes the Android app. Supporting workflows are listed below.

### Release (`deploy-playstore.yml`)

Build the Android App Bundle, verify its signature and deploy it to Google Play.

**Trigger:** Manual (`workflow_dispatch`)
**Inputs:**

- `track`: Play Store track (internal, alpha, beta, production)
- `release_notes`: Notes for the GitHub release (production only)
- `dry_run`: boolean, default **true**. When true the workflow builds and verifies the AAB and keeps it as an artifact, but does not upload to Play, tag or create a GitHub release. A real publish needs an explicit `-f dry_run=false` (or unchecking the box) and the `main` ref; anything other than the string `false` never publishes. A dry run on a branch uses that branch's workflow file and secrets.

The version always comes from `versionName` in `android/app/build.gradle`; there is no version input.

**Job `build`:** read version, Node from `.nvmrc`, `npm ci`, `npx tsc --noEmit`, `npm test -- --ci --maxWorkers=2`, Android build, signing verification, AAB artifact upload (14 days, every run), Play upload (only when `dry_run` is false and ref is `main`), run summary.
**Job `release`:** creates the GitHub release/tag `v<versionName>` only when `dry_run` is false, the track is `production` and the ref is `main`. It is the only job with `contents: write`.

Real publishes are serialized in the `release-publish` concurrency group (queued, never cancelled); each dry run gets its own group so it cannot replace a queued deploy. Build timeout: 40 minutes.

**To use:**

```bash
# Default is a dry run; safe check from any branch (build and verify only)
gh workflow run deploy-playstore.yml --ref <branch> -f dry_run=true -f track=internal

# Internal track (real upload: explicit dry_run=false required)
gh workflow run deploy-playstore.yml --ref main -f dry_run=false -f track=internal

# Production track (real upload + GitHub release)
gh workflow run deploy-playstore.yml --ref main -f dry_run=false -f track=production -f release_notes="v1.3.0 - Released"
```

The expected signing certificate SHA1 is defined once in the workflow-level `env` (`EXPECTED_SIGNING_SHA1`).

---

### Supporting Workflows

#### **PR Validation** (`pr-validate.yml`)

Automated checks on pull requests.

**Trigger:** On pull requests to main
**Checks:**

- TypeScript type checking
- Country data validation
- Flag assets verification

---

#### **Update Countries** (`update-countries.yml`)

Scheduled monthly country dataset updates.

**Trigger:** 1st of month at 3 AM UTC, or manual
**Purpose:** Automated maintenance of country reference data

---

## Secrets Required

For the release workflow to work, configure these GitHub Secrets:

| Secret                           | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| `ANDROID_KEYSTORE_BASE64`        | Base64-encoded Android keystore (production)      |
| `ANDROID_KEYSTORE_PASSWORD`      | Keystore password                                 |
| `ANDROID_KEY_ALIAS`              | Key alias in keystore                             |
| `ANDROID_KEY_PASSWORD`           | Key password                                      |
| `PLAYSTORE_SERVICE_ACCOUNT_JSON` | Google Play service account (for deploy workflow) |
| `MAPS_API_KEY`                   | Google Maps API Key (required for map features)   |

---

## Reusable Actions

Custom GitHub Actions used by workflows:

- **setup-android**: Installs JDK 21 and the Android SDK
- **build-aab**: Builds AAB using Gradle bundleRelease task
- **verify-aab-signature**: Verifies the AAB is signed with the expected production certificate (SHA1 passed in by the workflow)

---

## Troubleshooting

### Build fails with "Certificate not found"

The AAB signing verification failed. Check:

1. ANDROID_KEYSTORE_BASE64 secret is set correctly
2. Keystore file is valid and accessible
3. Production keystore SHA1 matches the one configured in Google Play Console (verify with: `keytool -list -v -keystore <path-to-keystore>`)

### Play Store upload fails

Check:

1. PLAYSTORE_SERVICE_ACCOUNT_JSON secret is configured
2. Service account has necessary permissions in Google Play Console
3. Track is valid (internal, alpha, beta, production)

### GitHub Release not created

GitHub releases are only created for real (not dry-run) production deploys from `main`. The AAB is attached to every run as an artifact for 14 days.
