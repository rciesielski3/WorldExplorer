import { getStyles } from '../../styles';
import { lightTheme, darkTheme } from '../../theme/tokens';

describe('Styles - PR #44 Changes', () => {
  describe('Typography Shadow Removal', () => {
    it('should remove textShadow from title style (light theme)', () => {
      const styles = getStyles(lightTheme);
      expect(styles.title.textShadowColor).toBeUndefined();
      expect(styles.title.textShadowOffset).toBeUndefined();
      expect(styles.title.textShadowRadius).toBeUndefined();
    });

    it('should remove textShadow from subtitle style (light theme)', () => {
      const styles = getStyles(lightTheme);
      expect(styles.subtitle.textShadowColor).toBeUndefined();
      expect(styles.subtitle.textShadowOffset).toBeUndefined();
      expect(styles.subtitle.textShadowRadius).toBeUndefined();
    });

    it('should remove textShadow from subtitle2 style (light theme)', () => {
      const styles = getStyles(lightTheme);
      expect(styles.subtitle2.textShadowColor).toBeUndefined();
      expect(styles.subtitle2.textShadowOffset).toBeUndefined();
      expect(styles.subtitle2.textShadowRadius).toBeUndefined();
    });

    it('should remove textShadow from title style (dark theme)', () => {
      const styles = getStyles(darkTheme);
      expect(styles.title.textShadowColor).toBeUndefined();
      expect(styles.title.textShadowOffset).toBeUndefined();
      expect(styles.title.textShadowRadius).toBeUndefined();
    });

    it('should remove textShadow from subtitle style (dark theme)', () => {
      const styles = getStyles(darkTheme);
      expect(styles.subtitle.textShadowColor).toBeUndefined();
      expect(styles.subtitle.textShadowOffset).toBeUndefined();
      expect(styles.subtitle.textShadowRadius).toBeUndefined();
    });

    it('should remove textShadow from subtitle2 style (dark theme)', () => {
      const styles = getStyles(darkTheme);
      expect(styles.subtitle2.textShadowColor).toBeUndefined();
      expect(styles.subtitle2.textShadowOffset).toBeUndefined();
      expect(styles.subtitle2.textShadowRadius).toBeUndefined();
    });

    it('should maintain font properties after textShadow removal', () => {
      const styles = getStyles(lightTheme);
      expect(styles.title.fontFamily).toBe('Inter-Bold');
      expect(styles.title.fontSize).toBe(28);
      expect(styles.title.color).toBe(lightTheme.colors.text);
    });

    it('should maintain subtitle font properties after textShadow removal', () => {
      const styles = getStyles(lightTheme);
      expect(styles.subtitle.fontFamily).toBe('Inter-Bold');
      expect(styles.subtitle.fontSize).toBe(20);
      expect(styles.subtitle.color).toBe(lightTheme.colors.text);
    });

    it('should maintain subtitle2 font properties after textShadow removal', () => {
      const styles = getStyles(lightTheme);
      expect(styles.subtitle2.fontFamily).toBe('Inter-Regular');
      expect(styles.subtitle2.fontSize).toBe(18);
      expect(styles.subtitle2.color).toBe(lightTheme.colors.text);
    });
  });

  describe('Country List Margin', () => {
    it('should add marginBottom to exploreListContent (light theme)', () => {
      const styles = getStyles(lightTheme);
      expect(styles.exploreListContent.marginBottom).toBe(32);
    });

    it('should add marginBottom to exploreListContent (dark theme)', () => {
      const styles = getStyles(darkTheme);
      expect(styles.exploreListContent.marginBottom).toBe(32);
    });

    it('should maintain paddingBottom alongside new marginBottom', () => {
      const styles = getStyles(lightTheme);
      expect(styles.exploreListContent.paddingBottom).toBe(160);
      expect(styles.exploreListContent.marginBottom).toBe(32);
    });

    it('should use appropriate spacing value (32 = lg spacing token)', () => {
      const styles = getStyles(lightTheme);
      // 32dp is the 'xl' spacing token
      expect(styles.exploreListContent.marginBottom).toBe(32);
    });
  });

  describe('Spacing Consistency', () => {
    it('should maintain consistent spacing in explore list container', () => {
      const styles = getStyles(lightTheme);
      const { exploreListContent } = styles;

      // Verify container has proper spacing
      expect(exploreListContent.paddingBottom).toBeDefined();
      expect(exploreListContent.marginBottom).toBeDefined();
      // Both should be numbers
      expect(typeof exploreListContent.paddingBottom).toBe('number');
      expect(typeof exploreListContent.marginBottom).toBe('number');
    });

    it('should not have conflicting margin/padding values', () => {
      const styles = getStyles(lightTheme);
      const { exploreListContent } = styles;

      // marginBottom should be less than paddingBottom (marginal spacing vs internal padding)
      expect(exploreListContent.marginBottom).toBeLessThan(exploreListContent.paddingBottom);
    });
  });
});
