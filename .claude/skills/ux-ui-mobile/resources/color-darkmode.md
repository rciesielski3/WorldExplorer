# Color and Dark Mode

All color comes from `theme/tokens.ts` through `useTheme()`. This file explains how to choose and
combine those tokens, and what to do when a role is missing.

```tsx
import { useTheme } from '../../../context/ThemeContext';

const { theme, isDarkMode } = useTheme();
<View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.cardBorder }} />
```

## Semantic roles available in `ThemeColors`

| Role | Tokens | Use |
|------|--------|-----|
| Page | `background`, `surface` | Screen background, then the first raised layer |
| Containers | `card`, `cardBorder`, `surfaceSubtle`, `surfaceVariant` | Cards, secondary buttons, input backgrounds, inactive states |
| Brand | `primary`, `primaryLight`, `primaryBorder`, `button`, `buttonStrong`, `buttonText` | Primary actions; `primaryLight` is a tint, not a text color |
| Accents | `secondary` (Earth Green, alias `teal`), `ocean`, `amber` and their `*Bg` tints | Maps, categories, streaks |
| Status | `success`, `warning`, `error` plus `*Bg` and `*Border` | Feedback; always with an icon or text |
| Text | `text`, `textSecondary`, `textTertiary`, `textOnCard`, `textOnCardSecondary` | Pick by background (page vs card) |
| Lines | `border` | Decoration only (about 8% alpha) |

Rules:

- Meaning is fixed: `error` is red, `success` is green, `warning` is amber. Never repurpose them for
  decoration, and never put destructive actions in green.
- `*Bg` tokens are translucent tints for badges and banners. Text on them uses the matching solid token
  (`error` on `errorBg`) or `buttonStrong` (the `ThemeColors` doc comment explains why plain `button`
  fails AA on `primaryLight` in light mode).
- Limit accent colors per screen. Brand identity is `primary` plus the section gradient
  (`theme.gradients.home|explore|map|default`); do not add a lavender gradient or a sixth accent.
- Need a color that does not exist? Add a role to `ThemeColors` with a light and a dark value in both
  `lightTheme` and `darkTheme` (the `satisfies ThemeColors` clause fails the build if one is missing),
  then add a contrast case to `theme/__tests__/accessibility.test.ts`. Do not inline a literal.

## Dark mode is a redesign, not an inversion

Pure `#000` on `#FFF` flipped is harsh and loses depth. Each role has a calibrated dark value:

| Concern | Light | Dark |
|---------|-------|------|
| Page | `#F5F7FA` | `#0D1117` (near-black, not pure black) |
| Primary | `skyBlue500` `#1E88E5` | `skyBlue300` `#64B5F6` (lighter so it clears contrast on dark) |
| Success / error | `#43A047` / `#E53935` | `#81C784` / `#EF9A9A` (desaturated pastel variants) |
| Text | `#1A1F2E` | `#F0F6FC` (off-white; not `#FFF` for long reading) |
| Secondary text | 60% alpha | 55% alpha |

Principles when you calibrate:

- Saturated colors vibrate on dark backgrounds: lower saturation, raise lightness.
- Re-check contrast; a pair that passes in light often fails in dark and vice versa.
- Same role, same meaning in both themes. Only the value changes.

## Layering and elevation in dark mode

Shadows are almost invisible on dark surfaces, so depth comes from lightness steps and borders.

- Stack from darkest to lightest as things get closer to the user:
  `background` (page) < `surface` < `card` < `surfaceVariant`/`surfaceSubtle` overlays (white at 5-8% alpha).
- Material 3 expresses elevation in dark mode as a tonal overlay (white tint rising with elevation), which
  is what `surfaceSubtle` and `surfaceVariant` do here. Prefer them over a heavier `shadows.lg`.
- Keep `cardBorder` on cards in dark mode (it is 8% white); it separates layers where shadows cannot.
- Keep the step between adjacent layers visible but small. If a card is indistinguishable from the page on a
  dim phone, raise the layer, do not add glow.
- `commonTokens.shadows` (`sm`, `md`, `lg`, via `Card`'s `elevation` prop) still matter in light mode and
  on Android (`elevation`). Do not stack a shadow and a tinted overlay at maximum strength together.
- Do not use blur or glass effects for readability-critical surfaces; they hurt contrast and performance
  on mid-range Android. Cards here are near-opaque (`card` is 95-98% alpha) on purpose.

## Contrast

- Body text 4.5:1; large text (18pt, or 14pt bold) and non-text UI such as icons and control boundaries 3:1.
- Measure against what is actually behind the text. `ScreenBackground` composes a world-map photo, a
  `theme.overlay.scrim`, and a gradient at `theme.overlay.gradientOpacity`; text placed directly on it
  relies on that scrim. Text on translucent cards: measure the blended color.
- Tools: the existing test helper in `theme/__tests__/accessibility.test.ts`, Android Accessibility Scanner,
  and a contrast checker for any one-off pair.
- Do not use `textTertiary` (28-35% alpha) for anything the user must read; it is for hints and disabled text.

## Status without color alone

Error, success and warning use color plus an icon (`MaterialCommunityIcons`) plus text. Correct and
incorrect quiz answers must stay distinguishable in grayscale. Avoid purple/pink pairs and red/green
pairs as the only distinction.

## Quick review

- [ ] No `#xxxxxx`, `rgb(`, or `rgba(` literal in the diff outside `theme/tokens.ts`
- [ ] Looked at both themes, on a device, at reduced brightness
- [ ] Each text/background pair measured; new reusable pairs covered by a test
- [ ] Dark layers distinguishable without relying on shadows
- [ ] No status communicated by color alone
