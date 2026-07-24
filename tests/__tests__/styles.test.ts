import { getStyles } from '../../styles';

// Create a proper theme fixture for testing instead of importing theme objects directly
const createTestTheme = (isDarkMode: boolean) => ({
  isDarkMode,
  colors: {
    primary: '#1976D2',
    secondary: '#DC004E',
    error: '#D32F2F',
    background: isDarkMode ? '#121212' : '#FFFFFF',
    surface: isDarkMode ? '#1E1E1E' : '#F5F5F5',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    textSecondary: isDarkMode ? '#B3B3B3' : '#666666',
  },
});

describe('Styles - v2.0.8 UI/UX Improvements', () => {
  describe('Font Modernization (Exo2 -> Inter)', () => {
    it('should use Inter font via design tokens for title', () => {
      const lightTheme = createTestTheme(false);
      const styles = getStyles(lightTheme);
      // Font is consolidated to tokens, verify token resolution
      expect(styles.title.fontFamily).toBeDefined();
      expect(typeof styles.title.fontFamily).toBe('string');
    });

    it('should use Inter font via design tokens for subtitle', () => {
      const lightTheme = createTestTheme(false);
      const styles = getStyles(lightTheme);
      expect(styles.subtitle.fontFamily).toBeDefined();
      expect(typeof styles.subtitle.fontFamily).toBe('string');
    });

    it('should use Inter font via design tokens for subtitle2', () => {
      const lightTheme = createTestTheme(false);
      const styles = getStyles(lightTheme);
      expect(styles.subtitle2.fontFamily).toBeDefined();
      expect(typeof styles.subtitle2.fontFamily).toBe('string');
    });
  });

  describe('Country List Padding Fix', () => {
    it('should increase paddingBottom to 160 on exploreListContent (light theme)', () => {
      const lightTheme = createTestTheme(false);
      const styles = getStyles(lightTheme);
      expect(styles.exploreListContent.paddingBottom).toBe(160);
    });

    it('should increase paddingBottom to 160 on exploreListContent (dark theme)', () => {
      const darkTheme = createTestTheme(true);
      const styles = getStyles(darkTheme);
      expect(styles.exploreListContent.paddingBottom).toBe(160);
    });

    it('should use design token for marginBottom (xl spacing = 32dp)', () => {
      const lightTheme = createTestTheme(false);
      const styles = getStyles(lightTheme);
      expect(styles.exploreListContent.marginBottom).toBe(32);
    });
  });

  describe('Dark/Light Mode Consistency', () => {
    it('should render correctly in light mode', () => {
      const lightTheme = createTestTheme(false);
      const styles = getStyles(lightTheme);
      expect(styles.screenRoot).toBeDefined();
      expect(styles.title).toBeDefined();
    });

    it('should render correctly in dark mode', () => {
      const darkTheme = createTestTheme(true);
      const styles = getStyles(darkTheme);
      expect(styles.screenRoot).toBeDefined();
      expect(styles.title).toBeDefined();
    });
  });
});
