# Accessibility (React Native on Android, TalkBack first)

Target: WCAG 2.2 AA. The repo already enforces part of it in tests; the rest needs a device.

## What is automated, what is not

- Automated: contrast of token pairs and the 48dp constant (`theme/__tests__/accessibility.test.ts`,
  `commonTokens.touchTarget.minimum`). If you add a color pair that carries text, add a case there.
- Not automated: reading order, label quality, announcements, font scaling, Reduce Motion, focus handling.
  These are the "what automation did not check" items for `docs/smoke/_template.md`.

## Criteria that matter most

| Criterion | Rule | In this repo |
|-----------|------|--------------|
| 1.4.3 Contrast | 4.5:1 body, 3:1 large text (18pt, or 14pt bold) | Use `text`, `textOnCard`, `buttonStrong`; avoid `textTertiary` for essential text |
| 1.4.11 Non-text contrast | 3:1 for icons, borders of inputs, focus rings | `theme.colors.border` is decorative only (about 8% alpha): inputs need a stronger edge or fill |
| 1.4.4 Resize text | Usable at 200% | Leave font scaling on; test at the largest size |
| 2.5.8 Target size | 24x24 absolute floor; this repo uses 48dp | `Button` is 48 high with `minWidth: 48` |
| 4.1.2 Name, role, value | Every control exposes all three | Props below |
| 1.4.1 Use of color | Never color alone | Pair error/success color with an icon and text (see `ErrorCard`) |

## React Native props

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel={t('favorites.remove')}   // what it is / does, localized
  accessibilityHint={t('favorites.removeHint')} // optional: the result of activating it
  accessibilityState={{ disabled, selected }}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
/>
```

- `accessibilityLabel` is the name. It must be localized (all five locales) like any visible string.
- Do not put the role in the label ("Delete button"); use `accessibilityRole`.
- `accessibilityHint` describes the outcome, only when the label is not enough. Keep it short.
- Icon-only controls always need a label. `src/components/ui/Button.tsx` and `ToggleSwitch.tsx` accept
  `accessibilityLabel`, and `Input.tsx` derives it from `label` or `placeholder`; custom
  `Pressable`/`TouchableOpacity` do not, so add it.
- Decorative images and icons: `accessible={false}` plus `importantForAccessibility="no"` so TalkBack skips them.
- Group related text into one focusable element (`accessible` on the container) instead of three
  separate swipes: a country card should read "Poland, Europe, population 38 million" as one item.
- Headings: `accessibilityRole="header"` on section titles so TalkBack users can jump between them.

## TalkBack (Android)

Check on a real device, whole flow, eyes off the screen:

- Swipe order follows visual order; no focus on hidden or off-screen elements
- Every actionable element is announced with a name and role, and nothing is announced twice
- Custom gestures (swipe, long press) have an accessible alternative (a button or `accessibilityActions`)
- Modals/sheets trap focus and return it to the trigger when closed
- Dynamic changes are announced: `AccessibilityInfo.announceForAccessibility(message)` for toasts,
  validation errors, quiz result feedback, or `accessibilityLiveRegion="polite"` on the changing text
- Touch exploration works on the map (`screens/MapScreen.tsx`): markers need labels, and country selection
  must be possible from a list as well

## Font scaling

- Keep the default (scaling on). Android users can enlarge text to about 200% via Font size and Display size.
- Never use fixed `height` on text containers; use `minHeight` and padding.
- Where a layout truly breaks, cap that specific `Text` with `maxFontSizeMultiplier={1.5}` (or 2.0); do not
  disable scaling globally.
- Rows that hold label + value should wrap to a column at large scale: use `flexWrap: 'wrap'` or switch
  `flexDirection` when `PixelRatio.getFontScale() > 1.3`.
- Test at the largest font size on a 360dp-wide device. Truncated primary text is a defect.
- Status in this repo: no `maxFontSizeMultiplier` is set anywhere; any cap is a new decision, so record why.

## Reduce Motion

Android exposes this as "Remove animations". Read it with `AccessibilityInfo.isReduceMotionEnabled()` and
subscribe to `reduceMotionChanged`.

```tsx
const [reduceMotion, setReduceMotion] = useState(false);
useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
  return () => sub.remove();
}, []);
```

- Reanimated 3.17 also offers `useReducedMotion()` from `react-native-reanimated`; prefer it inside
  animated components (`Button`, `Card`, `ProgressBar`, `ToggleSwitch`, `QuizResultsScreen` use Reanimated).
- When on: remove decoration (confetti, parallax, bounces, Lottie loops); keep state feedback but make it
  instant or at most 100ms (a toggle still changes, it just does not slide).
- Status: nothing in the repo reads this setting yet. New animation code should, and a follow-up should
  retrofit the existing components.

## Color blindness

- About 8% of men have a color-vision deficiency. Red/green alone is not a signal.
- Correct/incorrect quiz answers need an icon or label in addition to green/red.
- Do not rely on hue to distinguish map markers or chart series; vary shape, label, or pattern.

## Common mistakes

- `Pressable` with an icon and no label (TalkBack says "button")
- `accessibilityLabel` in English only
- Touch target visually 48dp but the pressable area smaller (padding on a child instead of the pressable)
- Disabled state shown by opacity only, not exposed via `accessibilityState`
- Error text appears but is never announced
- Contrast measured on the solid background while the text sits on a translucent card or gradient
  (`ScreenBackground` layers a scrim and a gradient; measure the composited result)

## Pre-merge test (device)

- [ ] TalkBack through the entire changed flow
- [ ] Largest font size and Display size: no clipping, no overlap, CTAs reachable
- [ ] Remove animations ON: nothing essential depends on motion
- [ ] Every new control has a localized label and a role
- [ ] New color pairs measured (4.5:1 / 3:1) in light and dark
- [ ] Touch targets at least 48dp
