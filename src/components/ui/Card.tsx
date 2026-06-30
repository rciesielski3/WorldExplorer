import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';
import { commonTokens } from '../../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg';
}

export function Card({ children, onPress, style, elevation = 'sm' }: CardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPress ? () => (scale.value = withSpring(1.02)) : undefined}
      onPressOut={onPress ? () => (scale.value = withSpring(1)) : undefined}
    >
      <Animated.View
        style={[
          {
            backgroundColor: theme.colors.surface,
            borderRadius: commonTokens.borderRadius.lg,
            padding: commonTokens.spacing.md,
            ...commonTokens.shadows[elevation],
          },
          animatedStyle,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
