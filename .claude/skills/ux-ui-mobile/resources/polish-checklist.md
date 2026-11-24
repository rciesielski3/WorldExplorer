# Polish Checklist

Small details that separate a polished app from an amateur one. Each item takes seconds in
implementation. Use this as the last pass before requesting review.

## Typography

- [ ] Use `typography` tokens (`displayLg`, `titleMd`, `bodyMd`, `caption`, ...); no ad hoc `fontSize`
- [ ] Fonts are Inter (`Inter-Regular`, `Inter-Bold`, `Inter-Medium`); do not add a second family
- [ ] Do not set `allowFontScaling={false}`; if a layout cannot cope, cap with `maxFontSizeMultiplier` (1.5-2.0)
- [ ] At most three type levels on one screen
- [ ] Dynamic numbers (timers, scores, streaks) use `fontVariant: ['tabular-nums']` to avoid layout shift
- [ ] Letter spacing only on all-caps labels (the `label` token already carries it)

## Spacing and layout

- [ ] Only `spacing` values (4/8/16/24/32/48); a value outside the scale is a bug or a new token
- [ ] Nested rounded shapes are concentric: inner radius = outer radius minus the padding between them
- [ ] Same gap between sibling cards and between sections everywhere on the screen
- [ ] Safe-area insets on top and bottom; nothing interactive under the system navigation bar or `FloatingNavBar`
- [ ] Touch targets 48dp minimum, with at least 8dp between adjacent targets

## Color and dark mode

- [ ] Everything from `theme.colors`; verified in both themes
- [ ] Semantic meaning is stable: `error` red, `success` green, `warning` amber; never swapped
- [ ] Contrast 4.5:1 body, 3:1 large text and icons; new pairs measured and, if reusable, added to `theme/__tests__/accessibility.test.ts`
- [ ] Text on tinted backgrounds uses `buttonStrong` or `textOnCard`, not plain `button` (see the `ThemeColors` doc comments)

## Motion and haptics

- [ ] Press feedback: scale to about 0.96 (never below 0.95), as `src/components/ui/Button.tsx` does with `withSpring`
- [ ] Animate `transform` and `opacity`; not `width`, `height`, `top`, `left`
- [ ] 200-300ms for standard transitions; nothing in a default interaction over 600ms
- [ ] Entering elements ease out; stagger 50ms, maximum 6-8 items
- [ ] Haptic only on confirmed outcomes (purchase done, answer submitted, selection snap), via `utils/haptics.ts`
- [ ] Reduce Motion handled: decorative motion off, state feedback shortened (see accessibility-mobile.md)

## Components and states

- [ ] Every interactive element shows a pressed state and a disabled state
- [ ] Empty state has a headline, an explanation, and a next action (`EmptyStateCard`)
- [ ] Errors say what happened and offer recovery (`ErrorCard`, `RetryErrorBanner`)
- [ ] Loading over about 300ms shows feedback; over about 1s a skeleton or progress that keeps layout
- [ ] One primary CTA per screen, at most two secondary actions
- [ ] Icons optically centered next to text; one icon family (`MaterialCommunityIcons`) throughout
- [ ] Images on busy or similar-colored backgrounds get a subtle 1px border (`theme.colors.border`)

## Platform

- [ ] Android hardware back works (`BackHandler` where a screen intercepts it)
- [ ] Pull-to-refresh only on lists that can be refreshed
- [ ] The ad banner (`src/components/AdBanner.tsx`) does not push primary actions off screen or overlap navigation

## Sanity checks

- [ ] 5-second test: show the screen for five seconds; ask what they would tap to do X
- [ ] Brightness 30% test: still legible
- [ ] Center-of-screen test: primary actions live in the comfortable middle area, not only at the far top

## Code review gate (10 points)

1. TypeScript clean: no `any`, no non-null assertions
2. Touch targets at least 48dp
3. TalkBack reading order sensible, every control labelled
4. Largest font size: layout holds
5. Reduce Motion ON: state changes still understandable
6. Contrast of each foreground/background pair measured
7. Smooth animations on a mid-range Android device
8. Empty, loading, and error states present
9. Safe areas respected
10. Haptics only on deliberate confirmations
