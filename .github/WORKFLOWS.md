# GitHub Actions Workflows

## Overview

This project has two main build scenarios plus supporting workflows:

### Build Scenarios

#### 1. **Build-Only** (`build-aab.yml`)
Generate Android App Bundle without uploading to Play Store.

**When to use:**
- Local testing and verification
- CI validation without production deployment
- Artifact download for manual testing

**Trigger:** Manual (`workflow_dispatch`)
**Inputs:** Optional release notes (for reference only)
**Output:** app-release.aab (available as Actions artifact for 30 days)

**To use:**
```bash
gh workflow run build-aab.yml --ref main
```

---

#### 2. **Build & Deploy** (`deploy-playstore.yml`)
Build Android App Bundle and deploy to Google Play Store.

**When to use:**
- Publishing to Play Store (internal testing, beta, production)
- Creating GitHub releases (production track only)

**Trigger:** Manual (`workflow_dispatch`)
**Inputs:**
- `version`: Release version (auto-detected from build.gradle if not provided)
- `track`: Play Store track (internal, alpha, beta, production)
- `release_notes`: Release notes for Play Store

**To use:**
```bash
# Internal track (testing)
gh workflow run deploy-playstore.yml --ref main \
  -f track=internal \
  -f release_notes="v1.3.0 - Testing"

# Production track (public release)
gh workflow run deploy-playstore.yml --ref main \
  -f version=1.3.0 \
  -f track=production \
  -f release_notes="v1.3.0 - Released"
```

---

### Supporting Workflows

#### 3. **PR Validation** (`pr-validate.yml`)
Automated checks on pull requests.

**Trigger:** On pull requests to main
**Checks:**
- TypeScript type checking
- Country data validation
- Flag assets verification

---

#### 4. **Update Countries** (`update-countries.yml`)
Scheduled monthly country dataset updates.

**Trigger:** 1st of month at 3 AM UTC, or manual
**Purpose:** Automated maintenance of country reference data

---

## Secrets Required

For both build scenarios to work, configure these GitHub Secrets:

| Secret | Purpose |
|--------|---------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded Android keystore (production) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias in keystore |
| `ANDROID_KEY_PASSWORD` | Key password |
| `PLAYSTORE_SERVICE_ACCOUNT_JSON` | Google Play service account (for deploy workflow) |

---

## Reusable Actions

Custom GitHub Actions used by workflows:

- **setup-android**: Configures JDK, Android SDK, NDK, environment paths
- **build-aab**: Builds AAB using Gradle bundleRelease task
- **sign-aab**: Verifies AAB is signed with correct production certificate

---

## Troubleshooting

### Build fails with "Certificate not found"
The AAB signing verification failed. Check:
1. ANDROID_KEYSTORE_BASE64 secret is set correctly
2. Keystore file is valid and accessible
3. Production keystore SHA1 matches `34:C6:3A:57:7B:3C:06:5F:B3:5D:18:C6:65:E3:B6:6B:3A:29:F9:5F`

### Play Store upload fails
Check:
1. PLAYSTORE_SERVICE_ACCOUNT_JSON secret is configured
2. Service account has necessary permissions in Google Play Console
3. Track is valid (internal, alpha, beta, production)

### GitHub Release not created
GitHub releases are only created for production track. For other tracks, artifacts are available via Actions tab.
