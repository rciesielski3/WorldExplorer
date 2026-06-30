import React from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

interface TopBarProps {
  title?: string;
  showAppName?: boolean;
  onSettingsPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  gradientColors?: [string, string];
}

export function TopBar({
  title,
  showAppName = false,
  onSettingsPress,
  showBack = false,
  onBackPress,
  gradientColors,
}: TopBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettingsPress?.();
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBackPress?.();
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        height: 56 + insets.top,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: gradientColors ? undefined : theme.colors.surface,
      }}
    >
      {/* Left Content */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <Pressable onPress={handleBackPress} style={{ marginRight: theme.spacing.md }}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        )}
        <Text
          style={{
            fontSize: showAppName ? theme.typography.sizes.title.fontSize : theme.typography.sizes.subtitle.fontSize,
            fontWeight: showAppName ? 'bold' : '600',
            fontFamily: showAppName ? theme.typography.weights.bold : theme.typography.weights.medium,
            color: showAppName ? theme.colors.primary : theme.colors.text,
          }}
        >
          {showAppName ? 'WorldExplorer' : title}
        </Text>
      </View>

      {/* Right Content */}
      {onSettingsPress && (
        <Pressable onPress={handleSettingsPress} hitSlop={8}>
          <MaterialCommunityIcons
            name="cog"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
      )}
    </View>
  );
}
