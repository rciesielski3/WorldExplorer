---
title: CI release build ignored the upload keystore
date: 2026-10-10
category: signing
symptoms:
  - CI builds of the release AAB were not signed with the production keystore, although the keystore secrets were decoded and passed to Gradle
root_cause: android/app/build.gradle release signing config only read key.properties; the ORG_GRADLE_PROJECT_* values injected by the CI action were never read.
fix: PR #51 reads the WORLDEXPLORER_UPLOAD_* Gradle properties first, then falls back to key.properties, then to the debug keystore.
prevention: Keep the signing-certificate check (verify-aab-signature action) in the pipeline; keep the signing inputs and the Gradle property names in sync.
---

## Symptoms

The build action decoded the production keystore from a secret and exported it to Gradle, yet the release
signing config did not use it. The symptom is reconstructed from the code before the fix, not from a
recorded run log: with no `key.properties` on a CI runner, the release config fell through to its last
branch, which points at `debug.keystore` (a local fallback so Gradle can evaluate the project). A bundle
signed that way cannot match the production certificate that
`.github/actions/verify-aab-signature/action.yml` checks against its expected SHA1.

## Root cause

The CI action `.github/actions/build-aab/action.yml` passes the signing material as environment variables:

```
ORG_GRADLE_PROJECT_WORLDEXPLORER_UPLOAD_STORE_FILE
ORG_GRADLE_PROJECT_WORLDEXPLORER_UPLOAD_STORE_PASSWORD
ORG_GRADLE_PROJECT_WORLDEXPLORER_UPLOAD_KEY_ALIAS
ORG_GRADLE_PROJECT_WORLDEXPLORER_UPLOAD_KEY_PASSWORD
```

Gradle exposes `ORG_GRADLE_PROJECT_<name>` as the project property `<name>`. But `signingConfigs.release` in
`android/app/build.gradle` had only two branches: use `key.properties` if the file exists, otherwise use the
debug keystore. `key.properties` and `*.keystore` are gitignored, so they do not exist on a CI runner, and
the injected properties were never consulted.

## Fix

Commit fd851a7 (PR #51) added a first branch that reads the Gradle properties:

```groovy
if (project.hasProperty('WORLDEXPLORER_UPLOAD_STORE_FILE')) {
    // CI: injected via ORG_GRADLE_PROJECT_* env vars (see .github/actions/build-aab)
    storeFile file(project.property('WORLDEXPLORER_UPLOAD_STORE_FILE'))
    storePassword project.property('WORLDEXPLORER_UPLOAD_STORE_PASSWORD')
    keyAlias project.property('WORLDEXPLORER_UPLOAD_KEY_ALIAS')
    keyPassword project.property('WORLDEXPLORER_UPLOAD_KEY_PASSWORD')
} else if (keystorePropertiesFile.exists()) {
    // local: key.properties
} else {
    // debug.keystore fallback (EAS injects its own config)
}
```

Resolution order is now: CI Gradle properties, then local `key.properties`, then the debug fallback.
The change is 7 lines added, 1 removed, in `android/app/build.gradle` only.

## Prevention

- After any signing change, build the release bundle in CI and let the `verify-aab-signature` verification step compare
  the certificate SHA1 with the expected production value; do not rely on the build merely succeeding.
- The debug fallback exists so Gradle can evaluate without secrets; it means a misconfigured pipeline
  still builds, just with the wrong key. A green build is not proof of correct signing.
- Keep the property names in `build.gradle` identical to the `ORG_GRADLE_PROJECT_*` names in
  `.github/actions/build-aab/action.yml`; renaming one without the other recreates this bug silently.
- Secrets used: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`,
  `ANDROID_KEY_PASSWORD` (see `.github/workflows/deploy-playstore.yml`). Never commit
  keystores or `key.properties`.

## References

- PR #51, commit fd851a7: `android/app/build.gradle`
- `.github/actions/build-aab/action.yml`, `.github/actions/verify-aab-signature/action.yml`
- Earlier related change: b30b9cf "fix: use production keystore for release builds"
