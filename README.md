# WorldExplorer

A React Native Expo-based Android app for exploring countries, capitals, and geographic information with locally bundled flag assets.

## Quick Start

```bash
npm install
npm start
```

## Building & Deployment

### Build Android Bundle (No Upload)

Generate a signed AAB artifact without uploading to Play Store.

```bash
gh workflow run build-aab.yml --ref main
```

Artifact available via GitHub Actions → Build Android Bundle → Artifacts (30-day retention).

---

### Deploy to Play Store

Build and upload AAB to Google Play Store.

**Internal Testing Track:**
```bash
gh workflow run deploy-playstore.yml --ref main \
  -f track=internal \
  -f release_notes="v1.3.0 - Testing"
```

**Beta Track:**
```bash
gh workflow run deploy-playstore.yml --ref main \
  -f track=beta \
  -f release_notes="v1.3.0 - Beta release"
```

**Production Release:**
```bash
gh workflow run deploy-playstore.yml --ref main \
  -f track=production \
  -f version=1.3.0 \
  -f release_notes="v1.3.0 - Official release"
```

---

## Workflows

Two main CI/CD workflows manage build and deployment:

1. **build-aab.yml** - Build-only (generates artifact for download)
2. **deploy-playstore.yml** - Build & deploy to Play Store

For detailed workflow documentation, see [.github/WORKFLOWS.md](.github/WORKFLOWS.md).

---

## Requirements

- Node.js 18+
- Android SDK (configured via CI)
- GitHub secrets for Play Store deployment (see [.github/WORKFLOWS.md](.github/WORKFLOWS.md))
