// theme/tokens.ts — WorldExplorer Design Tokens

// ─── Palette (raw values, not exported) ────────────────────────────────────

const palette = {
  // Sky Blue — primary brand colour
  skyBlue500: '#1E88E5',
  skyBlue400: '#42A5F5',
  skyBlue300: '#64B5F6',
  skyBlueBg: 'rgba(30,136,229,0.12)',
  skyBlueBorder: 'rgba(30,136,229,0.25)',

  // Earth Green — secondary accent (maps, success)
  earthGreen500: '#43A047',
  earthGreen400: '#66BB6A',
  earthGreen300: '#81C784',
  earthGreenBg: 'rgba(67,160,71,0.12)',

  // Ocean Blue — tertiary accent
  oceanBlue500: '#0277BD',
  oceanBlue400: '#039BE5',
  oceanBlue300: '#4FC3F7',
  oceanBlueBg: 'rgba(2,119,189,0.12)',

  // Amber — quiz streaks, warnings
  amber500: '#F59E0B',
  amberBg: 'rgba(245,158,11,0.13)',

  // Semantic — success
  successLight: '#43A047',
  successDark: '#81C784',
  successBgLight: 'rgba(67,160,71,0.12)',
  successBgDark: 'rgba(129,199,132,0.12)',
  successBorderLight: 'rgba(67,160,71,0.25)',
  successBorderDark: 'rgba(129,199,132,0.25)',

  // Semantic — error
  errorLight: '#E53935',
  errorDark: '#EF9A9A',
  errorBgLight: 'rgba(229,57,53,0.12)',
  errorBgDark: 'rgba(239,154,154,0.12)',
  errorBorderLight: 'rgba(229,57,53,0.25)',
  errorBorderDark: 'rgba(239,154,154,0.25)',

  // Semantic — warning (same in both modes)
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.12)',

  // Dark mode backgrounds
  dark900: '#0D1117',
  dark800: '#161B22',
  dark700: '#1C2128',
  cardBgDark: 'rgba(255,255,255,0.05)',
  cardBorderDark: 'rgba(255,255,255,0.08)',

  // Dark mode text
  textDark: '#F0F6FC',
  textSecondaryDark: 'rgba(240,246,252,0.55)',
  textTertiaryDark: 'rgba(240,246,252,0.28)',

  // Light mode backgrounds
  lightBg: '#F5F7FA',
  lightBg2: '#FFFFFF',
  lightCard: '#FFFFFF',
  lightBorder: 'rgba(0,0,0,0.08)',

  // Light mode text
  lightText: '#1A1F2E',
  lightTextSecondary: 'rgba(26,31,46,0.60)',
  lightTextTertiary: 'rgba(26,31,46,0.35)',

  // Neutral Blue Grey — 'default' gradient for screens with no section branding
  neutralGrey300: '#90A4AE',
  neutralGrey400: '#78909C',
  neutralGrey500: '#607D8B',
  neutralGrey700: '#455A64',
} as const;

// ─── Common tokens (shared between light and dark themes) ──────────────────

export const commonTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 999,
  },
  typography: {
    display:   { fontFamily: 'Exo2-Bold',    fontSize: 32, lineHeight: 40 },
    displayLg: { fontFamily: 'Exo2-Bold',    fontSize: 28, lineHeight: 34 },
    displayMd: { fontFamily: 'Exo2-Bold',    fontSize: 22, lineHeight: 28 },
    displaySm: { fontFamily: 'Exo2-Bold',    fontSize: 18, lineHeight: 24 },
    titleLg:   { fontFamily: 'Exo2-Bold',    fontSize: 16, lineHeight: 22 },
    titleMd:   { fontFamily: 'Exo2-Bold',    fontSize: 14, lineHeight: 20 },
    bodyLg:    { fontFamily: 'Exo2-Regular', fontSize: 15, lineHeight: 22 },
    bodyMd:    { fontFamily: 'Exo2-Regular', fontSize: 13, lineHeight: 19 },
    bodySm:    { fontFamily: 'Exo2-Regular', fontSize: 11, lineHeight: 16 },
    caption:   { fontFamily: 'Exo2-Regular', fontSize: 10, lineHeight: 14 },
    label:     { fontFamily: 'Exo2-Bold',    fontSize: 10, lineHeight: 14, letterSpacing: 0.8 },
  },
  shadows: {
    sm: {
      elevation: 2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.10,
      shadowRadius: 2,
    },
    md: {
      elevation: 4,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    lg: {
      elevation: 8,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.20,
      shadowRadius: 8,
    },
  },
  touchTarget: {
    minimum: 48,
  },
} as const;

// ─── Convenience re-exports (backward-compatible) ──────────────────────────

export const spacing = commonTokens.spacing;
export const radius = commonTokens.borderRadius;
export const typography = commonTokens.typography;

// ─── Theme types ───────────────────────────────────────────────────────────

export type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  primary: string;
  primaryLight: string;
  primaryBorder: string;
  secondary: string;
  secondaryBg: string;
  ocean: string;
  oceanBg: string;
  /** Alias for secondary (Earth Green) — backward-compatible */
  teal: string;
  tealBg: string;
  amber: string;
  amberBg: string;
  success: string;
  successBg: string;
  successBorder: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  /** Slightly elevated background for error icon containers */
  errorIconBg: string;
  /** Subtle elevated surface for secondary buttons and card containers */
  surfaceSubtle: string;
  /** Surface variant for input backgrounds and inactive states */
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  button: string;
  buttonText: string;
  border: string;
};

export type ThemeGradients = {
  home: readonly [string, string, ...string[]];
  explore: readonly [string, string, ...string[]];
  map: readonly [string, string, ...string[]];
  /** Neutral gradient for screens without a specific section colour (e.g. Settings). */
  default: readonly [string, string, ...string[]];
};

/**
 * Tokens for `ScreenBackground`'s scrim + gradient tint layers.
 * - `scrim` brings the world-map photo close to the solid theme background
 *   so text/cards keep their designed WCAG AA contrast.
 * - `gradientOpacity` keeps the brand-gradient tint subtle — strong enough
 *   to read as section identity, faint enough not to shift text contrast.
 */
export type ThemeOverlay = {
  scrim: string;
  gradientOpacity: number;
};

export type TypographyStyles = typeof commonTokens.typography;

export type TypographyShortcuts = {
  sizes: {
    title: (typeof commonTokens.typography)['titleLg'];
    subtitle: (typeof commonTokens.typography)['titleMd'];
  };
  weights: {
    bold: string;
    medium: string;
  };
};

export type Theme = {
  colors: ThemeColors;
  gradients: ThemeGradients;
  overlay: ThemeOverlay;
  spacing: typeof commonTokens.spacing;
  typography: TypographyStyles & TypographyShortcuts;
  shadows: typeof commonTokens.shadows;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

/** @deprecated Use ThemeColors directly. Kept for backward compatibility. */
export type DarkTheme = { colors: ThemeColors };

// ─── Typography Shortcuts ──────────────────────────────────────────────────

const typographyShortcuts: TypographyShortcuts = {
  sizes: {
    title: commonTokens.typography.titleLg,
    subtitle: commonTokens.typography.titleMd,
  },
  weights: {
    bold: 'Exo2-Bold',
    medium: 'Exo2-Regular',
  },
};

// ─── Light theme ───────────────────────────────────────────────────────────

export const lightTheme = {
  colors: {
    background:    palette.lightBg,
    surface:       palette.lightBg2,
    card:          palette.lightCard,
    cardBorder:    palette.lightBorder,
    primary:       palette.skyBlue500,
    primaryLight:  palette.skyBlueBg,
    primaryBorder: palette.skyBlueBorder,
    secondary:     palette.earthGreen500,
    secondaryBg:   palette.earthGreenBg,
    ocean:         palette.oceanBlue500,
    oceanBg:       palette.oceanBlueBg,
    teal:          palette.earthGreen500,
    tealBg:        palette.earthGreenBg,
    amber:         palette.amber500,
    amberBg:       palette.amberBg,
    success:       palette.successLight,
    successBg:     palette.successBgLight,
    successBorder: palette.successBorderLight,
    warning:       palette.warning,
    warningBg:     palette.warningBg,
    error:         palette.errorLight,
    errorBg:       palette.errorBgLight,
    errorBorder:   palette.errorBorderLight,
    errorIconBg:   'rgba(229,57,53,0.15)',
    surfaceSubtle: 'rgba(0,0,0,0.03)',
    surfaceVariant: 'rgba(0,0,0,0.05)',
    text:          palette.lightText,
    textSecondary: palette.lightTextSecondary,
    textTertiary:  palette.lightTextTertiary,
    button:        palette.skyBlue500,
    buttonText:    '#FFFFFF',
    border:        palette.lightBorder,
  } satisfies ThemeColors,
  spacing: commonTokens.spacing,
  typography: {
    ...commonTokens.typography,
    ...typographyShortcuts,
  },
  shadows: commonTokens.shadows,
  gradients: {
    home:    [palette.skyBlue500, palette.oceanBlue500] as const,
    explore: [palette.earthGreen500, palette.skyBlue500] as const,
    map:     [palette.oceanBlue500, palette.earthGreen500] as const,
    default: [palette.neutralGrey500, palette.neutralGrey700] as const,
  } satisfies ThemeGradients,
  overlay: {
    // Derived from lightBg so the scrim matches the solid background it
    // stands in for; opaque enough to preserve text/card contrast over the
    // world-map photo.
    scrim: 'rgba(245,247,250,0.85)',
    gradientOpacity: 0.16,
  } satisfies ThemeOverlay,
};

// ─── Dark theme ────────────────────────────────────────────────────────────

export const darkTheme = {
  colors: {
    background:    palette.dark900,
    surface:       palette.dark800,
    card:          palette.cardBgDark,
    cardBorder:    palette.cardBorderDark,
    primary:       palette.skyBlue300,
    primaryLight:  palette.skyBlueBg,
    primaryBorder: palette.skyBlueBorder,
    secondary:     palette.earthGreen300,
    secondaryBg:   palette.earthGreenBg,
    ocean:         palette.oceanBlue300,
    oceanBg:       palette.oceanBlueBg,
    teal:          palette.earthGreen300,
    tealBg:        palette.earthGreenBg,
    amber:         palette.amber500,
    amberBg:       palette.amberBg,
    success:       palette.successDark,
    successBg:     palette.successBgDark,
    successBorder: palette.successBorderDark,
    warning:       palette.warning,
    warningBg:     palette.warningBg,
    error:         palette.errorDark,
    errorBg:       palette.errorBgDark,
    errorBorder:   palette.errorBorderDark,
    errorIconBg:   'rgba(239,154,154,0.18)',
    surfaceSubtle: 'rgba(255,255,255,0.05)',
    surfaceVariant: 'rgba(255,255,255,0.08)',
    text:          palette.textDark,
    textSecondary: palette.textSecondaryDark,
    textTertiary:  palette.textTertiaryDark,
    button:        palette.skyBlue300,
    buttonText:    '#FFFFFF',
    border:        palette.cardBorderDark,
  } satisfies ThemeColors,
  spacing: commonTokens.spacing,
  typography: {
    ...commonTokens.typography,
    ...typographyShortcuts,
  },
  shadows: commonTokens.shadows,
  gradients: {
    home:    [palette.skyBlue300, palette.oceanBlue300] as const,
    explore: [palette.earthGreen300, palette.skyBlue300] as const,
    map:     [palette.oceanBlue300, palette.earthGreen300] as const,
    default: [palette.neutralGrey300, palette.neutralGrey400] as const,
  } satisfies ThemeGradients,
  overlay: {
    // Derived from dark900 so the scrim matches the solid background it
    // stands in for; opaque enough to preserve text/card contrast over the
    // world-map photo.
    scrim: 'rgba(13,17,23,0.82)',
    gradientOpacity: 0.20,
  } satisfies ThemeOverlay,
};
