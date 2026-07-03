// components/SplashScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

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
        backgroundColor: '#FFFFFF',
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#1F1F1F',
          marginBottom: 24,
        }}
      >
        WorldExplorer
      </Text>
      <ActivityIndicator size="large" color="#1E88E5" />
    </View>
  );
}
