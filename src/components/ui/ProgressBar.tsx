import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

export function ProgressBar({ progress, color }: ProgressBarProps) {
  const { theme } = useTheme();
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress * 100, { duration: 300 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View
      style={{
        width: '100%',
        height: 4,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: color || theme.colors.primary,
            borderRadius: theme.borderRadius.sm,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
