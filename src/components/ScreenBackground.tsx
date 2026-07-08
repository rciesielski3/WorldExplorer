import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import type { ThemeGradients } from '../../theme/tokens';

export interface ScreenBackgroundProps {
  /**
   * Which brand gradient to tint the background with. Falls back to the
   * neutral `default` gradient for screens with no specific section
   * branding (e.g. Settings).
   */
  gradient?: keyof ThemeGradients;
  /** Extra style merged onto the outer background layer. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Shared full-bleed screen background: world map photo + a readability
 * scrim + a low-opacity brand-gradient tint.
 *
 * This renders as an absolutely-positioned layer that fills its parent —
 * mount it as the first child of a `flex: 1`, transparent-background
 * container and place the screen's real content as normal-flow siblings
 * after it:
 *
 * ```tsx
 * <View style={{ flex: 1 }}>
 *   <ScreenBackground gradient="home" />
 *   <ScrollView>...</ScrollView>
 * </View>
 * ```
 *
 * The scrim + gradient opacity come from `theme.overlay` so both layers
 * stay tuned per light/dark theme without touching this component.
 */
export function ScreenBackground({
  gradient = 'default',
  style,
  testID = 'screen-background',
}: ScreenBackgroundProps) {
  const { theme } = useTheme();
  const gradientColors = theme.gradients[gradient] ?? theme.gradients.default;

  return (
    <ImageBackground
      testID={testID}
      source={require('../../assets/worldMapBackground.png')}
      style={[StyleSheet.absoluteFillObject, style]}
      resizeMode="cover"
    >
      {/*
        Readability scrim: brings the photo close to the solid theme
        background so text/cards on top keep their designed WCAG AA
        contrast regardless of what's under them in the photo.
      */}
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.overlay.scrim }]}
        pointerEvents="none"
      />
      {/* Brand gradient tint: subtle per-section colour identity. */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { opacity: theme.overlay.gradientOpacity }]}
        pointerEvents="none"
      />
    </ImageBackground>
  );
}

export default ScreenBackground;
