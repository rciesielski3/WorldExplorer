---
name: ux-ui-mobile
description: UX/UI guidelines for WorldExplorer screens (Expo 53, React Native 0.79, react-native-paper MD3 conventions, custom theme via useTheme() and theme/tokens.ts, Reanimated 3.17). Use when designing or reviewing a screen or component, working on dark mode, contrast, touch targets, loading/empty/error states, font scaling, Reduce Motion, TalkBack, or when a screen looks cheap or AI-generated. Includes a pre-merge checklist for UI pull requests.
---

# UX/UI Mobile (WorldExplorer)

Practical rules for UI work in this repo. Principles are stack-agnostic; every code
example uses what actually exists here. Where the repo and a guideline disagree, the
repo's tokens and components win, and the gap is a finding to report, not a reason to
invent a new pattern.

## Stack facts (verified against the repo)

- Expo `^53.0.0`, React Native `0.79.6`, Reanimated `~3.17.4`, gesture-handler `~2.24.0`.
- Theme: `useTheme()` from `context/ThemeContext.tsx` returns `{ theme, isDarkMode, toggleTheme, isLoading }`.
  Colors are read as `theme.colors.*`; the `Theme` type lives in `theme/tokens.ts`.
- Tokens: `theme/tokens.ts` (repo-root `theme/`, not `src/theme/`). Exports `lightTheme`, `darkTheme`,
  `commonTokens` (`spacing`, `borderRadius`, `typography`, `shadows`, `touchTarget.minimum = 48`),
  and the shortcuts `spacing`, `radius`, `typography`.
- Reusable UI: `src/components/ui/` (`Button`, `Card`, `Input`, `Badge`, `ProgressBar`, `ToggleSwitch`,
  `SearchBar`, `EmptyStateCard`, `ErrorCard`, `RetryErrorBanner`, ...). Reuse before writing new ones.
- `react-native-paper` `^5.13.1` is a declared dependency, but no source file imports it today and there is
  no `PaperProvider`. The UI is custom components that follow Material Design 3 patterns (rounded corners,
  elevation, ripples, 48dp targets). If you introduce Paper components, wrap them in a `PaperProvider`
  whose theme is derived from `theme.colors` so there is still one source of truth. Never hardcode a second
  palette.
- i18n: `useTranslation()` from react-i18next, strings in `locales/{en,es,fr,de,pl}.json`
  (validate with `npm run countries:validate`).
- Haptics: helpers in `utils/haptics.ts` (`triggerLightHaptic`, `triggerMediumHaptic`, ...).

## New screen checklist

- [ ] All colors from `theme.colors.*`; no hex or `rgb()` literals in screens/components
- [ ] Spacing from `spacing` (4/8/16/24/32/48); radius from `radius`; type from `typography`
- [ ] Touch targets at least `commonTokens.touchTarget.minimum` (48dp); small icons get `hitSlop`
- [ ] Safe areas respected (`useSafeAreaInsets`, as in `screens/SettingsScreen.tsx`)
- [ ] Text contrast 4.5:1 (3:1 for large text and non-text UI); check both themes
- [ ] Dark mode reviewed as its own design (layering, not inversion): see resources/color-darkmode.md
- [ ] Every icon-only control has `accessibilityLabel` and `accessibilityRole`
- [ ] Status never conveyed by color alone (icon + text + color)
- [ ] Loading, empty, and error states implemented, not only the happy path
- [ ] User-facing strings localized in all five locale files
- [ ] Animations use `transform`/`opacity` only, 200-300ms, and respect Reduce Motion
- [ ] Haptics on confirmed outcomes only, not on every tap
- [ ] One primary CTA per screen

## Pre-merge checklist for UI PRs

Automation covers contrast of token pairs (`theme/__tests__/accessibility.test.ts`) and component
rendering tests. It does not cover the items below; do them on a device and record them in the PR
(or in a copy of `docs/smoke/_template.md`).

- [ ] Light and dark mode both walked through on a device
- [ ] TalkBack pass over the whole flow (reading order, labels, roles, announcements)
- [ ] Font size at the largest system setting (and Display size at Large): no clipped text, no overlap
- [ ] "Remove animations" ON (Android's Reduce Motion): state changes still understandable
- [ ] Offline (airplane mode): screen degrades gracefully
- [ ] Small screen (about 360dp wide) and a large one
- [ ] Android back button behaves as expected
- [ ] Contrast of any new color pair measured, not eyeballed
- [ ] 5-second test: someone unfamiliar can tell what to tap

## Core principles

1. Tokens over literals. A new color or size is a token first, then a usage.
2. Native conventions beat novelty (Material 3 patterns; `Platform.select` only for real platform differences).
3. Dark mode is a redesign: separate calibrated values per role, not an inverted palette.
4. Accessibility is a gate, not polish: contrast, targets, labels, scalable text.
5. Every async view has four states: loading, content, empty, error.
6. Motion communicates state; decoration without a purpose is removed.
7. Fewer, stronger elements: hierarchy comes from size, weight, and space, not from extra decoration.

## Resources

| File | Use when |
|------|----------|
| [resources/polish-checklist.md](resources/polish-checklist.md) | Final pass before merge; what separates polished from amateur |
| [resources/accessibility-mobile.md](resources/accessibility-mobile.md) | Labels, roles, TalkBack, font scaling, Reduce Motion, announcements |
| [resources/color-darkmode.md](resources/color-darkmode.md) | Semantic colors, dark layering, elevation, contrast, token usage |
| [resources/states-loading-empty-error.md](resources/states-loading-empty-error.md) | Loading, empty, error, offline, retry patterns using existing components |
| [resources/ai-pitfalls.md](resources/ai-pitfalls.md) | Reviewing generated UI; recovery workflow |

## Known gaps in the repo (report, do not silently work around)

- No source file reads `AccessibilityInfo` (Reduce Motion, screen reader state) and none sets
  `maxFontSizeMultiplier`; font scaling is left at the React Native default.
- Some literal colors remain outside `theme/tokens.ts` (for example in `src/components/AdBanner.tsx`).
- `CLAUDE.md` mentions `src/theme/` and `src/locales/`; the real paths are `theme/` and `locales/`.
