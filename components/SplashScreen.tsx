// components/SplashScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { fixedColors } from '../theme/tokens';

/**
 * SplashScreen - Displayed while theme preference is loading from storage.
 * Shows app name and loading indicator to prevent theme flash on startup.
 *
 * Note: Uses static light theme colors (not useTheme) to avoid circular dependency.
 * The splash screen appears only during initial load before theme context is available.
 */
export function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: fixedColors.splash.background,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: fixedColors.splash.title,
          marginBottom: 24,
        }}
      >
        WorldExplorer
      </Text>
      <ActivityIndicator size="large" color={fixedColors.splash.spinner} />
    </View>
  );
}
