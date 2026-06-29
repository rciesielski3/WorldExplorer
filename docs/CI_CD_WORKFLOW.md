# CI/CD Workflow Documentation

## Overview

WorldExplorer uses GitHub Actions for automated validation and release workflows.

### Workflows

#### 1. PR Validation (Automatic)
- **Trigger:** Pull request to `main` branch
- **Actions:**
  - TypeScript compilation check
  - Countries data validation
  - Flag verification (all 250 flags present)
- **Duration:** ~2-3 minutes
- **Status:** Required to pass before merge

#### 2. Release Build (Manual)
- **Trigger:** Workflow dispatch (manual trigger from Actions tab)
- **Actions:**
  - Build Android App Bundle (AAB)
  - Verify production signing certificate
  - Create GitHub release with AAB artifact
- **Duration:** ~45-60 minutes (first build longer due to Kotlin compilation)
- **Input:** Optional release notes

## Build Environment

- **OS:** macOS (GitHub Actions runner)
- **JDK:** Java 11 (Temurin)
- **Android SDK:** API 35 (Target SDK)
- **Android NDK:** 27.1.12297006
- **Build Tools:** 35.0.0
- **Gradle:** 8.10.2 (wrapper)

## Manual Release Process

### Prerequisites

1. All code merged to `main` branch
2. Version bump committed (versionCode incremented)
3. Release notes prepared in PR description

### Steps

1. **Navigate to Actions tab**
   - Go to: github.com/rciesielski3/WorldExplorer/actions
   - Select: "Build & Release AAB" workflow

2. **Click "Run workflow"**
   - Select branch: `main`
   - Optional: Add release notes in input field
   - Click: "Run workflow"

3. **Monitor build**
   - Watch "Build & Release AAB" job
   - Build takes ~45-60 minutes
   - View logs if needed

4. **Verify release**
   - Go to Releases page
   - Verify AAB file attached
   - Check file size (~22-24MB)

5. **Upload to Play Store**
   - Download AAB from GitHub release
   - Upload to Google Play Console
   - Use STORE_RELEASE_NOTES.md for release notes
   - Submit for review

## Troubleshooting

### PR Validation Fails
- TypeScript error: Check code compiles locally
- Data validation error: Run `npm run countries:validate` locally
- Flag verification error: Run `npm run flags:verify` locally

### Release Build Fails
- Gradle build error: Check local build works with same commands
- Signing verification fails: Verify keystore file exists in repo
- AAB not found: Gradle bundleRelease must succeed first

### Network Issues
- Gradle download timeout: GitHub Actions may retry automatically
- Firebase dependency issues: Check internet connectivity
- SDK installation: May take extra time on first run

## CI/CD Files

- `.github/workflows/pr-validate.yml` - PR validation workflow
- `.github/workflows/release-build.yml` - Release build workflow
- `.github/actions/setup-android/action.yml` - Android setup action
- `.github/actions/build-aab/action.yml` - AAB build action
- `.github/actions/sign-aab/action.yml` - AAB signing verification
