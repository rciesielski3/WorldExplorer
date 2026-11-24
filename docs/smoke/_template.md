# On-device smoke test: <version / PR / branch>

Copy this file to `docs/smoke/<YYYY-MM-DD>-<version>.md` and fill it in. Run it on a real device with a
release-like build (an internal-testing build from Play Store or a release APK/AAB install), not only the
emulator or Expo Go. Mark each line pass / fail / n/a and add a note for anything that is not a clean pass.
Never paste keys, tokens, or account credentials here.

## Run info

| Field | Value |
|-------|-------|
| Date | |
| Tester | |
| App version / versionCode | |
| Build source | internal testing / release APK / dev client |
| Device and Android version | |
| Account state | fresh install / upgrade from version ___ ; free / premium |
| Network | Wi-Fi / mobile / offline |

## Core flow

- [ ] Cold start reaches Home without a crash or a theme flash (splash shows while the preference loads)
- [ ] Explore: search and filters work; an empty result shows the empty state
- [ ] Country details open, flag and data render, favorite toggles and persists after restart
- [ ] Quiz: start, answer, finish, results screen, stats update
- [ ] Daily challenge and streak behave correctly across a date change (if the build includes them)
- [ ] Settings: language switch updates visible strings in every tab

## Ads (AdMob, `react-native-google-mobile-ads`)

- [ ] Banner loads on screens that show it (`src/components/AdBanner.tsx`); no blank gap or layout jump
- [ ] A release build uses production ad unit IDs; test IDs only in dev builds
- [ ] Banner does not cover navigation or primary actions, including at large font size
- [ ] Non-personalized ads request is in effect (`requestNonPersonalizedAdsOnly`); consent flow shown where required
- [ ] Premium ad behavior matches the product intent (the banner is rendered in `ExploreScreen`, `CountryDetailsScreen` and `QuizScreen`; check whether premium is meant to hide it and record what actually happens)
- [ ] No ads or ad errors surface offline beyond an empty slot

## In-app purchase (RevenueCat, `react-native-purchases`, `context/PremiumContext.tsx`)

- [ ] Offerings load and the price shown is the store's localized price
- [ ] Purchase with a license-tester account completes; premium unlocks immediately
- [ ] Cancel at the purchase sheet: app stays in free state, no error spam
- [ ] Restore purchases on a reinstall or second device restores the entitlement
- [ ] Premium state persists after force-stop and restart
- [ ] Offline: purchase button explains the problem instead of hanging; existing premium keeps working
- [ ] Entitlement id and product id match the RevenueCat dashboard (`premium` unless overridden by env)

## Maps (`react-native-maps`, `screens/MapScreen.tsx`)

- [ ] Tiles render (no gray grid): the Android Maps API key is present and not restricted to the wrong package/SHA
- [ ] Markers appear; tap shows the callout; selecting a country opens its details
- [ ] Pan, zoom, and rotation are smooth; no crash when rotating or backgrounding the app
- [ ] Offline: map degrades without crashing; the rest of the app still works
- [ ] Release-signed build tested (the key's SHA restriction differs between debug and release signing)

## Notifications (`expo-notifications`, `src/components/NotificationService.ts`)

- [ ] Permission prompt appears at a sensible moment (Android 13+ runtime permission) and denial is handled
- [ ] Scheduling a reminder produces a notification at the chosen time (wait for it; do not assume)
- [ ] Reminder arrives with the app backgrounded and with the app force-stopped
- [ ] Tapping the notification opens the app on the expected screen
- [ ] Disabling reminders in Settings cancels pending notifications
- [ ] Reminder survives a device reboot (if the feature promises it) and respects Do Not Disturb

## Dark mode and theming

- [ ] Toggle in Settings switches immediately and persists after restart
- [ ] Following the system theme works while no manual preference is saved
- [ ] Every screen visited in both themes: no unreadable text, no light-only surfaces, status colors distinguishable
- [ ] Ad banner and map look acceptable in dark mode

## Accessibility (TalkBack)

- [ ] TalkBack on: Home, Explore, Details, Quiz, Settings can be fully operated by swipe and double tap
- [ ] Icon-only controls announce a meaningful, localized label and role
- [ ] Quiz feedback (correct/incorrect) is announced, not conveyed by color alone
- [ ] Largest font size and Display size: no clipped text or unreachable buttons
- [ ] "Remove animations" ON: nothing essential depends on motion
- [ ] Touch targets feel comfortable (48dp minimum)

## Offline and flaky network

- [ ] Airplane mode: cold start works from bundled/cached data
- [ ] Network drops mid-action (quiz, purchase, favorite): no crash, clear message, state recovers when back online
- [ ] Retry actions work after reconnecting

## Release hygiene

- [ ] App icon, name, and splash correct; version shown matches the build
- [ ] No debug banners, yellow boxes, or dev-only screens reachable (for example test screens)
- [ ] Upgrade from the previous production version keeps favorites, quiz history, theme, and language

## What automation did not check

Fill this in on every run. List what CI and the Jest suite (`npm test`, `npx tsc --noEmit`,
`countries:validate`, `flags:verify`) cannot see, and what you deliberately skipped or could not test.
Unit tests mock AdMob, RevenueCat, maps, and notifications, so those integrations are only exercised here.

- Not covered by automation in this change:
  -
- Skipped in this run, and why (device missing, no license tester, no store access):
  -
- Residual risk and who accepted it:
  -

## Result

| Area | Result | Notes / issue link |
|------|--------|--------------------|
| Core flow | | |
| Ads | | |
| Purchases | | |
| Maps | | |
| Notifications | | |
| Dark mode | | |
| TalkBack | | |
| Offline | | |

Verdict: ship / ship with known issues / block
