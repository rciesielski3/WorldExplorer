import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../context/ThemeContext';
import { commonTokens } from '../../../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'text';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'filled',
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const getStyles = () => {
    const baseStyle: ViewStyle = {
      height: 48,
      minWidth: 48,
      paddingHorizontal: commonTokens.spacing.lg,
      borderRadius: commonTokens.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    };

    switch (variant) {
      case 'outlined':
        return [
          baseStyle,
          {
            borderWidth: 2,
            borderColor: disabled ? theme.colors.textTertiary : theme.colors.secondary,
          },
        ];
      case 'text':
        return [baseStyle, { paddingHorizontal: commonTokens.spacing.md }];
      default:
        return [
          baseStyle,
          {
            backgroundColor: disabled ? theme.colors.textTertiary : theme.colors.primary,
          },
        ];
    }
  };

  const getTextColor = () => {
    if (variant === 'filled') return '#FFFFFF';
    if (variant === 'outlined') return disabled ? theme.colors.textTertiary : theme.colors.secondary;
    return theme.colors.primary;
  };

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => (scale.value = withSpring(1.02))}
        onPressOut={() => (scale.value = withSpring(1))}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        <Animated.View style={[getStyles(), animatedStyle]}>
          <Text
            style={{
              color: getTextColor(),
              fontSize: commonTokens.typography.label.fontSize,
              fontFamily: commonTokens.typography.label.fontFamily,
              fontWeight: '500',
            }}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
