import React from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../ScreenBackground';
import { ThemeProvider } from '../../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../../theme/tokens';

// NOTE: ThemeProvider renders a SplashScreen placeholder while it loads the
// persisted theme preference from AsyncStorage, and only mounts `children`
// once that resolves. We use the `findBy*` (async, auto-retrying) query for
// the first assertion in each test so it waits for the real content to
// mount rather than racing the splash screen.
const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

function renderScreenBackground(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('ScreenBackground Component', () => {
  describe('Component Definition', () => {
    it('should be a React component', () => {
      expect(typeof ScreenBackground).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const { findByTestId } = renderScreenBackground(<ScreenBackground />);

      expect(await findByTestId('screen-background')).toBeTruthy();
    });

    it('should render with a custom testID', async () => {
      const { findByTestId } = renderScreenBackground(
        <ScreenBackground testID="home-background" />
      );

      expect(await findByTestId('home-background')).toBeTruthy();
    });

    it('should default to the "screen-background" testID', async () => {
      const { findByTestId, queryByTestId } = renderScreenBackground(
        <ScreenBackground />
      );

      expect(await findByTestId('screen-background')).toBeTruthy();
      expect(queryByTestId('home-background')).toBeNull();
    });

    it('should render the world map photo full-bleed via ImageBackground', async () => {
      const { findByTestId, UNSAFE_getByType } = renderScreenBackground(
        <ScreenBackground />
      );

      await findByTestId('screen-background');
      const imageBackground = UNSAFE_getByType(ImageBackground);
      expect(imageBackground.props.resizeMode).toBe('cover');
      expect(imageBackground.props.source).toBeTruthy();
    });

    it('should merge extra style onto the background layer', async () => {
      const { findByTestId, UNSAFE_getByType } = renderScreenBackground(
        <ScreenBackground style={{ opacity: 0.5 }} />
      );

      await findByTestId('screen-background');
      const imageBackground = UNSAFE_getByType(ImageBackground);
      const flattened = StyleSheet.flatten(imageBackground.props.style);
      expect(flattened).toEqual(expect.objectContaining({ opacity: 0.5 }));
    });
  });

  describe('Gradient Prop', () => {
    it('should accept a "home" gradient', async () => {
      const { findByTestId, UNSAFE_getByType } = renderScreenBackground(
        <ScreenBackground gradient="home" testID="bg" />
      );

      await findByTestId('bg');
      expect(UNSAFE_getByType(LinearGradient).props.colors).toEqual(
        lightTheme.gradients.home
      );
    });

    it('should accept an "explore" gradient', async () => {
      const { findByTestId, UNSAFE_getByType } = renderScreenBackground(
        <ScreenBackground gradient="explore" testID="bg" />
      );

      await findByTestId('bg');
      expect(UNSAFE_getByType(LinearGradient).props.colors).toEqual(
        lightTheme.gradients.explore
      );
    });

    it('should accept a "map" gradient', async () => {
      const { findByTestId, UNSAFE_getByType } = renderScreenBackground(
        <ScreenBackground gradient="map" testID="bg" />
      );

      await findByTestId('bg');
      expect(UNSAFE_getByType(LinearGradient).props.colors).toEqual(
        lightTheme.gradients.map
      );
    });

    it('should fall back to the "default" gradient when no gradient prop is given', async () => {
      const { findByTestId, UNSAFE_getByType } = renderScreenBackground(
        <ScreenBackground testID="bg" />
      );

      await findByTestId('bg');
      expect(UNSAFE_getByType(LinearGradient).props.colors).toEqual(
        lightTheme.gradients.default
      );
    });

    it('should fall back to the "default" gradient for an unrecognised gradient key', async () => {
      const { findByTestId, UNSAFE_getByType } = renderScreenBackground(
        // @ts-expect-error deliberately passing an invalid gradient key to
        // exercise the `theme.gradients[gradient] ?? theme.gradients.default`
        // fallback.
        <ScreenBackground gradient="not-a-real-gradient" testID="bg" />
      );

      await findByTestId('bg');
      expect(UNSAFE_getByType(LinearGradient).props.colors).toEqual(
        lightTheme.gradients.default
      );
    });
  });

  describe('Theme Tokens', () => {
    it('should use the light theme overlay scrim colour by default', async () => {
      const { findByTestId, UNSAFE_getAllByType } = renderScreenBackground(
        <ScreenBackground />
      );

      await findByTestId('screen-background');
      const scrimLayer = UNSAFE_getAllByType(View).find((node) => {
        const flat = StyleSheet.flatten(node.props.style) || {};
        return 'backgroundColor' in flat;
      });
      expect(scrimLayer).toBeTruthy();
      expect(StyleSheet.flatten(scrimLayer!.props.style).backgroundColor).toBe(
        lightTheme.overlay.scrim
      );
    });

    it('should apply the theme gradient opacity to the gradient tint layer', async () => {
      const { findByTestId, UNSAFE_getByType } = renderScreenBackground(
        <ScreenBackground />
      );

      await findByTestId('screen-background');
      const gradientLayer = UNSAFE_getByType(LinearGradient);
      const flattened = StyleSheet.flatten(gradientLayer.props.style);
      expect(flattened.opacity).toBe(lightTheme.overlay.gradientOpacity);
    });
  });

  describe('Accessibility', () => {
    it('should not intercept touches on the scrim layer', async () => {
      const { findByTestId, UNSAFE_getAllByType } = renderScreenBackground(
        <ScreenBackground />
      );

      await findByTestId('screen-background');
      const scrimLayer = UNSAFE_getAllByType(View).find((node) => {
        const flat = StyleSheet.flatten(node.props.style) || {};
        return 'backgroundColor' in flat;
      });
      expect(scrimLayer!.props.pointerEvents).toBe('none');
    });

    it('should not intercept touches on the gradient tint layer', async () => {
      const { findByTestId, UNSAFE_getByType } = renderScreenBackground(
        <ScreenBackground />
      );

      await findByTestId('screen-background');
      expect(UNSAFE_getByType(LinearGradient).props.pointerEvents).toBe('none');
    });
  });
});

describe('ScreenBackground dark theme tokens', () => {
  it('exposes a distinct scrim/gradient-opacity pair from the light theme', () => {
    // Sanity-checks the fixtures this suite relies on: dark and light theme
    // overlays must differ, otherwise the "Theme Tokens" tests above could
    // pass even if ScreenBackground ignored `useTheme()` entirely.
    expect(darkTheme.overlay.scrim).not.toBe(lightTheme.overlay.scrim);
    expect(darkTheme.overlay.gradientOpacity).not.toBe(
      lightTheme.overlay.gradientOpacity
    );
  });
});
