import {
  commonTokens,
  lightTheme,
  darkTheme,
  spacing,
  radius,
  typography,
} from '../tokens';

describe('Design Tokens', () => {
  describe('Spacing Values', () => {
    it('should have correct spacing values', () => {
      expect(commonTokens.spacing.xs).toBe(4);
      expect(commonTokens.spacing.sm).toBe(8);
      expect(commonTokens.spacing.md).toBe(16);
      expect(commonTokens.spacing.lg).toBe(24);
      expect(commonTokens.spacing.xl).toBe(32);
      expect(commonTokens.spacing.xxl).toBe(48);
    });

    it('should export spacing as convenience re-export', () => {
      expect(spacing).toEqual(commonTokens.spacing);
    });

    it('should have all expected spacing keys', () => {
      const expectedKeys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
      expect(Object.keys(commonTokens.spacing)).toEqual(expectedKeys);
    });
  });

  describe('Border Radius Values', () => {
    it('should have correct border radius values', () => {
      expect(commonTokens.borderRadius.sm).toBe(6);
      expect(commonTokens.borderRadius.md).toBe(10);
      expect(commonTokens.borderRadius.lg).toBe(14);
      expect(commonTokens.borderRadius.xl).toBe(20);
      expect(commonTokens.borderRadius.full).toBe(999);
    });

    it('should export radius as convenience re-export', () => {
      expect(radius).toEqual(commonTokens.borderRadius);
    });

    it('should have all expected border radius keys', () => {
      const expectedKeys = ['sm', 'md', 'lg', 'xl', 'full'];
      expect(Object.keys(commonTokens.borderRadius)).toEqual(expectedKeys);
    });
  });

  describe('Typography', () => {
    it('should have display typography styles', () => {
      expect(commonTokens.typography.display).toBeDefined();
      expect(commonTokens.typography.display.fontFamily).toBe('Exo2-Bold');
      expect(commonTokens.typography.display.fontSize).toBe(32);
    });

    it('should have headline/title typography styles', () => {
      expect(commonTokens.typography.titleLg).toBeDefined();
      expect(commonTokens.typography.titleMd).toBeDefined();
      expect(commonTokens.typography.titleLg.fontSize).toBe(16);
    });

    it('should have body typography styles', () => {
      expect(commonTokens.typography.bodyLg).toBeDefined();
      expect(commonTokens.typography.bodyMd).toBeDefined();
      expect(commonTokens.typography.bodySm).toBeDefined();
    });

    it('should have label typography style', () => {
      expect(commonTokens.typography.label).toBeDefined();
      expect(commonTokens.typography.label.fontFamily).toBe('Exo2-Bold');
      expect(commonTokens.typography.label.letterSpacing).toBe(0.8);
    });

    it('should export typography as convenience re-export', () => {
      expect(typography).toEqual(commonTokens.typography);
    });

    it('should have all typography styles with required properties', () => {
      Object.values(commonTokens.typography).forEach((style) => {
        expect(style).toHaveProperty('fontFamily');
        expect(style).toHaveProperty('fontSize');
        expect(style).toHaveProperty('lineHeight');
      });
    });
  });

  describe('Light Theme Colors', () => {
    it('should have all required color keys', () => {
      const requiredKeys = [
        'primary',
        'secondary',
        'success',
        'error',
        'surface',
        'surfaceVariant',
        'text',
        'background',
        'card',
        'border',
        'textOnCard',
        'textOnCardSecondary',
      ];
      requiredKeys.forEach((key) => {
        expect(lightTheme.colors).toHaveProperty(key);
        expect(typeof lightTheme.colors[key as keyof typeof lightTheme.colors]).toBe('string');
      });
    });

    it('should have Sky Blue (primary) color', () => {
      expect(lightTheme.colors.primary).toBe('#1E88E5');
    });

    it('should have Earth Green (secondary) color', () => {
      expect(lightTheme.colors.secondary).toBe('#43A047');
    });

    it('should have Ocean Blue color', () => {
      expect(lightTheme.colors.ocean).toBe('#0277BD');
    });

    it('should have semantic colors', () => {
      expect(lightTheme.colors.success).toBe('#43A047');
      expect(lightTheme.colors.error).toBe('#E53935');
      expect(lightTheme.colors.warning).toBeDefined();
    });

    it('should have card background with high opacity', () => {
      expect(lightTheme.colors.card).toBe('rgba(255, 255, 255, 0.98)');
    });

    it('should have WCAG AA compliant text-on-card colors', () => {
      expect(lightTheme.colors.textOnCard).toBe('#000000');
      expect(lightTheme.colors.textOnCardSecondary).toBe('#424245');
    });
  });

  describe('Dark Theme Colors', () => {
    it('should have all required color keys', () => {
      const requiredKeys = [
        'primary',
        'secondary',
        'success',
        'error',
        'surface',
        'surfaceVariant',
        'text',
        'background',
        'card',
        'border',
        'textOnCard',
        'textOnCardSecondary',
      ];
      requiredKeys.forEach((key) => {
        expect(darkTheme.colors).toHaveProperty(key);
        expect(typeof darkTheme.colors[key as keyof typeof darkTheme.colors]).toBe('string');
      });
    });

    it('should have Sky Blue (primary) color adjusted for dark mode', () => {
      expect(darkTheme.colors.primary).toBe('#64B5F6');
    });

    it('should have Earth Green (secondary) color adjusted for dark mode', () => {
      expect(darkTheme.colors.secondary).toBe('#81C784');
    });

    it('should have Ocean Blue color adjusted for dark mode', () => {
      expect(darkTheme.colors.ocean).toBe('#4FC3F7');
    });

    it('should have semantic colors', () => {
      expect(darkTheme.colors.success).toBe('#81C784');
      expect(darkTheme.colors.error).toBe('#EF9A9A');
      expect(darkTheme.colors.warning).toBeDefined();
    });

    it('should have card background with high opacity (0.95)', () => {
      expect(darkTheme.colors.card).toBe('rgba(30, 30, 35, 0.95)');
    });

    it('should have WCAG AA compliant text-on-card colors', () => {
      expect(darkTheme.colors.textOnCard).toBe('#FFFFFF');
      expect(darkTheme.colors.textOnCardSecondary).toBe('#E5E5E7');
    });
  });

  describe('Theme Consistency', () => {
    it('should have matching color keys between light and dark themes', () => {
      const lightKeys = Object.keys(lightTheme.colors).sort();
      const darkKeys = Object.keys(darkTheme.colors).sort();
      expect(lightKeys).toEqual(darkKeys);
    });

    it('should have gradients defined', () => {
      expect(lightTheme.gradients).toBeDefined();
      expect(darkTheme.gradients).toBeDefined();
      expect(lightTheme.gradients.home).toHaveLength(2);
      expect(lightTheme.gradients.explore).toHaveLength(2);
      expect(lightTheme.gradients.map).toHaveLength(2);
    });

    it('should have shadows defined', () => {
      expect(commonTokens.shadows.sm).toBeDefined();
      expect(commonTokens.shadows.md).toBeDefined();
      expect(commonTokens.shadows.lg).toBeDefined();
    });

    it('should have minimum touch target of 48dp', () => {
      expect(commonTokens.touchTarget.minimum).toBe(48);
    });
  });
});
