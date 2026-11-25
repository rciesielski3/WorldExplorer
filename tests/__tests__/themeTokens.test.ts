import { lightTheme, darkTheme, fixedColors } from '../../theme/tokens';

// Values that were previously hardcoded as hex literals in the UI. They must
// resolve to the original colour in BOTH themes so the visuals stay unchanged.
const LEGACY_THEME_COLORS = {
  onAccent: '#FFFFFF',
  shadow: '#000000',
  switchThumb: '#FFFFFF',
  textMuted: '#666666',
  successStrong: '#1B7F4C',
  errorStrong: '#B42318',
  info: '#3B82F6',
  countryAction: '#6200EE',
} as const;

describe('theme tokens replacing hardcoded hex colours', () => {
  it.each(Object.entries(LEGACY_THEME_COLORS))(
    '%s keeps its original value in light and dark themes',
    (key, value) => {
      const light = lightTheme.colors[key as keyof typeof lightTheme.colors];
      const dark = darkTheme.colors[key as keyof typeof darkTheme.colors];
      expect(light.toUpperCase()).toBe(value);
      expect(dark.toUpperCase()).toBe(value);
    },
  );

  it('exposes fixed colours with their original values', () => {
    expect(fixedColors.loader).toBe('#6366F1');
    expect(fixedColors.splash).toEqual({
      background: '#FFFFFF',
      title: '#1F1F1F',
      spinner: '#1E88E5',
    });
    expect(fixedColors.errorBoundary.background.toUpperCase()).toBe('#0B0B16');
    expect(fixedColors.mapDark.geometry.toUpperCase()).toBe('#1D2C4D');
  });
});
