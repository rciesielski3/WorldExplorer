import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { commonTokens } from '../../theme/tokens';

interface TopBarProps {
  onSettingsPress?: () => void;
  appName?: string;
}

export function TopBar({ onSettingsPress, appName = 'WorldExplorer' }: TopBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettingsPress?.();
  };

  return (
    <View
      style={{
        paddingTop: insets.top + commonTokens.spacing.md,
        paddingHorizontal: commonTokens.spacing.lg,
        paddingBottom: commonTokens.spacing.md,
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: commonTokens.typography.titleLg.fontSize,
          fontFamily: commonTokens.typography.titleLg.fontFamily,
          fontWeight: '700',
          color: theme.colors.primary,
          letterSpacing: 0.5,
        }}
      >
        {appName}
      </Text>

      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          padding: commonTokens.spacing.sm,
        })}
      >
        <MaterialCommunityIcons
          name="cog-outline"
          size={24}
          color={theme.colors.primary}
        />
      </Pressable>
    </View>
  );
}
