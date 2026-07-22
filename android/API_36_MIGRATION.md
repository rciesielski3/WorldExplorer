# Android API Level 36 (Android 16) Migration

**Date:** 2026-07-22
**Target API:** 36 (Android 16)
**Deadline:** August 31, 2026

## Compatibility Status

⚠️ **ACTION REQUIRED** — No deprecated-API or third-party-SDK blockers were found, but the
`targetSdkVersion`/`compileSdkVersion` bump made in Task 1 does **not** currently take effect.
The build is still resolving to API 35. See "Changes Required" below before this can be marked
PASS.

### Verified Components

| Component | Installed version | API 36 status |
|---|---|---|
| Firebase JS SDK (`firebase`) | `^12.15.0` (resolved `12.16.0`) | ✅ Compatible |
| `firebase-admin` (Node/dev tooling only, not shipped in APK) | `^14.1.0` | ✅ N/A to Android runtime |
| RevenueCat (`react-native-purchases`) | `^10.4.2` (resolved `10.4.3`) | ✅ Compatible — reads `rootProject.ext` SDK values, so it will follow whatever compile/target SDK the app module ultimately resolves to |
| React Native | `0.79.6` | ✅ Compatible; bundled `gradle/libs.versions.toml` defaults to `compileSdk=35` / `targetSdk=35` (see finding below) |
| Expo | `^53.0.0` (resolved `53.0.27`) | ⚠️ Expo SDK 53 was built/tested against API 35. Expo's own API-36-ready SDK is 54. Staying on SDK 53 is not a hard blocker (AGP/Play Store only require `targetSdkVersion=36`), but it is the reason the default version catalog still ships 35/35. |

Note: the values quoted in the original task brief for Firebase (`^1.13.3`) and React Native
(`0.80.3`) do not match what is actually installed in `package.json` / `node_modules`. The table
above reflects the real, verified versions.

### Deprecated APIs

- `grep -r "deprecated|Deprecated" src/ android/ --include="*.java" --include="*.kt" --include="*.tsx" --include="*.ts"` → **no matches**.
- No first-party `.java`/`.kt` source outside the two standard Expo-generated files
  (`android/app/src/main/java/com/adateo/WorldExplorer/MainActivity.kt`,
  `MainApplication.kt`) — both are Expo boilerplate with no deprecated Android API calls.

### AndroidManifest.xml Review (`android/app/src/main/AndroidManifest.xml`)

- ✅ No `android:permission-group` usage (deprecated API 30).
- ✅ No hardcoded `android:minSdkVersion` / `android:targetSdkVersion` in the manifest — these are
  driven entirely by Gradle, as expected.
- ✅ `POST_NOTIFICATIONS` (required for notifications on API 33+) is **not** declared in the app's
  own manifest, but is correctly contributed via manifest merge from
  `node_modules/expo-notifications/android/src/main/AndroidManifest.xml`, which declares both
  `RECEIVE_BOOT_COMPLETED` and `POST_NOTIFICATIONS`. Verified by reading that file directly — no
  action needed.
- ⚠️ `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` are still declared. These have been
  effectively no-ops for apps targeting API 30+ (scoped storage) and API 33+ (storage
  permissions replaced by granular media permissions), so they don't block API 36, but they are
  dead weight and should be removed or replaced with the granular `READ_MEDIA_*` permissions if
  the app still needs storage access. Not a merge blocker — flagged as cleanup.
- ℹ️ `SYSTEM_ALERT_WINDOW` (overlay permission) and `com.google.android.gms.permission.AD_ID`
  remain valid, unchanged permission declarations on API 36.
- ℹ️ `<uses-library android:name="org.apache.http.legacy" android:required="false"/>` is present
  but marked optional (`required="false"`), so it does not affect installability on Android 16
  devices that no longer ship the legacy Apache HTTP client.

### Changes Required

**Confirmed root cause (verified against Gradle plugin source, not assumed):** Task 1's commit
(`9ddbd49 chore: update targetSdkVersion to 36`) added a bare `targetSdkVersion=36` key to
`android/gradle.properties`. This key name is **not** the one the Expo Gradle plugin looks for.

Verified in
`node_modules/expo-modules-autolinking/android/expo-gradle-plugin/expo-autolinking-settings-plugin/src/main/kotlin/expo/modules/plugin/ExpoAutolinkingSettingsExtension.kt`
(the `useExpoVersionCatalog()` function, lines ~105-122): the settings plugin only imports SDK
overrides from Gradle properties named `android.buildToolsVersion`, `android.minSdkVersion`,
`android.compileSdkVersion`, `android.targetSdkVersion`, and `android.kotlinVersion` (note the
`android.` prefix). Because `gradle.properties` has `targetSdkVersion=36` instead of
`android.targetSdkVersion=36`, the override provider (`settings.providers.gradleProperty(...)`)
never matches, and the plugin silently falls back to the base catalog values baked into
`node_modules/react-native/gradle/libs.versions.toml`, which for React Native 0.79.6 are:

```
minSdk = "24"
targetSdk = "35"
compileSdk = "35"
buildTools = "35.0.0"
```

`ExpoRootProjectPlugin.kt` (`android/build.gradle` → `apply plugin: "expo-root-project"`) then
uses `extra.setIfNotExist(...)` to populate `rootProject.ext.compileSdkVersion` /
`targetSdkVersion` from that same catalog — again landing on 35/35. `android/app/build.gradle`
reads `rootProject.ext.compileSdkVersion` / `targetSdkVersion` directly, and
`react-native-purchases`'s own `android/build.gradle` does the same via
`getExtOrIntegerDefault(...)`. So today, **the whole module graph still compiles and targets API
35**, not 36, despite Task 1's commit. This was corroborated by the stale build artifact at
`android/app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml`,
which shows `android:targetSdkVersion="35"` from the last local build.

**Required fix (for Task 1 / before Task 3 build verification is meaningful):**

```properties
# android/gradle.properties
android.compileSdkVersion=36
android.targetSdkVersion=36
# optionally, if a newer Build Tools release is desired:
# android.buildToolsVersion=36.0.0
```

(the existing bare `targetSdkVersion=36` line can be left in place or removed — it is inert and
harmless, just not the property the plugin reads).

After this correction, re-run a Gradle sync/build and re-check
`android/app/build/intermediates/merged_manifest/*/AndroidManifest.xml` for
`android:targetSdkVersion="36"` to confirm the override actually took effect before proceeding to
Task 3 (build APK/AAB + emulator testing).

No changes are required for Firebase, RevenueCat, or first-party source code — those are already
compatible with API 36 once the SDK version override above is corrected.

### Testing

- Deprecated-API grep: clean (automated, this task).
- Manifest review: clean aside from the legacy storage permissions noted above (automated, this
  task).
- Full instrumented/unit test run and manual Android 16 emulator verification were **not**
  performed as part of this task — that is explicitly Task 3's scope ("Build APK/AAB with API 36",
  "Test on Android 16 emulator"). Running `./gradlew` locally in this environment failed before
  even reaching a build step (`A problem occurred starting process 'command 'node''`), i.e. the
  sandboxed shell used for this verification pass cannot invoke `node` from Gradle's exec
  environment — this is an environment limitation, not evidence about the app itself. Task 3
  should run the real build in an environment with a working Node toolchain and confirm the
  corrected SDK versions actually apply.

### Migration Notes

- Notification runtime permissions (API 33+): already correctly supplied via
  `expo-notifications`'s bundled manifest; no manual declaration needed.
- No first-party deprecated Android API usage was found.
- The only blocking item is the Gradle property naming issue described above — it is a
  configuration bug, not an SDK/library incompatibility.

### Rollout Plan

1. Update build configuration (Task 1) — **partially done**: `targetSdkVersion=36` was added to
   `gradle.properties` but under the wrong property name, so it has no effect yet. Needs a
   follow-up fix (see "Changes Required").
2. Verify compatibility (Task 2) — ✅ this document; found the Task 1 config gap.
3. Build APK/AAB with API 36 (Task 3) — blocked until the property-name fix lands and a build
   confirms `targetSdkVersion=36` in the merged manifest.
4. Test on Android 16 emulator (Task 3).
5. Internal/closed testing on Play Store (Task 4).
6. Production deployment (Task 5).
