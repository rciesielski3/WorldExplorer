# AI Pitfalls: Patterns That Make Generated UI Look Cheap

Generated UI (from a model, a mock-up tool, or a quick prompt) has systematic weaknesses. This list is
for reviewing such output, and for reviewing your own code produced with AI help, before merge.

## The five big patterns

### 1. Visual excess
Gradients on every surface, shadows on every element, glow "for atmosphere", a decorative icon beside every field.
Fix: remove everything that does not serve function, then add back only what communicates hierarchy or
state. In this repo `ScreenBackground` already supplies the one brand gradient; do not add more.

### 2. Inconsistent spacing and alignment
Paddings of 16, 18, 22, and 27 in the same screen; different gaps between identical cards.
Fix: round every value to the `spacing` tokens (4/8/16/24/32/48). A value outside the scale is an error.

### 3. Decorative typography
Custom display fonts on body text, five weights, arbitrary letter spacing.
Fix: use the `typography` tokens (Inter family). One font family, at most three levels per screen,
letter spacing only on the `label` style.

### 4. Chaotic color
Literal hex values, eight accents, low-contrast gray text, pastel gradients, red used for positive things.
Fix: `theme.colors` only; semantic roles keep their meaning; verify contrast; review dark mode
separately (see color-darkmode.md).

### 5. Mixed conventions
A navigation pattern from one platform, switches and sheets from another, web-style hover assumptions.
Fix: stay with the app's established patterns (`FloatingNavBar`, `TopBar`, Material 3 shapes and
ripples). Check Android back behavior. There is no hover on touch screens; every state must work on press.

## More traps

6. **No interaction states.** Static layouts with no pressed, disabled, focus, or loading state.
   Every interactive element needs at least default, pressed, disabled, and (for async) loading.
7. **Purposeless animation.** Bounces and fades that answer no question. Each animation must say what
   it communicates; otherwise remove it. Check Reduce Motion.
8. **Button hierarchy soup.** Filled and outlined buttons of equal weight side by side. One primary
   (`Button` `variant="filled"`), secondary as `outlined`, tertiary as `text`.
9. **Arbitrary radius.** Use `radius` tokens (`sm` 6, `md` 10, `lg` 14, `xl` 20, `full`) and keep
   nested shapes concentric.
10. **Icon overuse.** An icon on every row. Use icons where they speed recognition; labels are
    mandatory for icon-only controls. One family: `MaterialCommunityIcons`.
11. **Shadows everywhere.** One or two elevation levels (`commonTokens.shadows` `sm`/`md`), and in dark
    mode rely on layering and borders.
12. **Generic gradient backgrounds** (the purple/lavender default). Use the section gradients in
    `theme.gradients`.
13. **Invented components.** The generated code recreates a button, card, or banner that already exists
    in `src/components/ui/`. Reuse, extend, or fix the existing one.
14. **Hardcoded English strings.** User-facing text must go through `useTranslation()` and exist in
    all five `locales/*.json` files.
15. **Happy-path only.** No loading, empty, error, or offline handling; see states-loading-empty-error.md.
16. **Missing accessibility.** Icon buttons without labels, text smaller than the type scale,
    targets below 48dp, status by color alone.
17. **Stale or nonexistent APIs.** Generated code may import components or props that do not exist in
    this stack (Expo 53, RN 0.79, Reanimated 3.17, gesture-handler 2.24). Verify imports compile
    (`npx tsc --noEmit`) and that APIs exist in the installed versions, not the latest docs.

## Five-second test

Show the screen for five seconds. If the viewer cannot say what the screen is for and what to tap,
the hierarchy is wrong. Signs it looks generated: uniform card grid with identical weight, every
element has a shadow and a gradient, headings in a decorative font, lavender accents, icons with no
function, "Welcome back!" filler copy.

## Recovery workflow

1. **Strip.** Remove gradients, shadows, glows, and decorative icons. Look at the bare structure.
2. **Normalize spacing.** Snap every margin, padding, and gap to `spacing` tokens.
3. **Replace type.** Map every text style to a `typography` token; drop extra fonts and weights.
4. **Replace color.** Swap literals for `theme.colors`; fix semantic misuse; measure contrast.
5. **Rebuild hierarchy.** One primary action, secondary actions quieter, tertiary as text.
6. **Normalize radius.** Tokens only, concentric nesting.
7. **Add states.** Pressed, disabled, loading, empty, error, offline.
8. **Check platform behavior.** Back button, safe areas, keyboard overlap, TalkBack order.
9. **Reuse components.** Replace re-invented pieces with `src/components/ui/*`.
10. **Re-run the five-second test**, then the pre-merge checklist in SKILL.md.

## Tools

- `npx tsc --noEmit` and `npm test` for the basics
- Android Studio Layout Inspector and the "Show layout bounds" developer option for spacing audits
- Android Accessibility Scanner and TalkBack for accessibility
- A contrast checker for any new color pair
- Side-by-side comparison with the closest existing screen (`HomeScreen`, `ExploreScreen`)

## Anti-AI checklist

- [ ] No hex or rgb literals; spacing/radius/typography from tokens
- [ ] No component duplicates something in `src/components/ui/`
- [ ] Strings localized; no hardcoded English
- [ ] Interaction states present; one primary CTA
- [ ] Both themes reviewed; contrast measured
- [ ] Loading, empty, error, offline handled
- [ ] Imports and props verified against installed versions
- [ ] Animations purposeful, Reduce Motion respected
