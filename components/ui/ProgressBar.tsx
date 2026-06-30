import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  useEffect,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { commonTokens } from '../../theme/tokens';

interface ProgressBarProps {
  progress: number; // 0-1
  duration?: number; // animation duration in ms
}

export function ProgressBar({ progress, duration = 500 }: ProgressBarProps) {
  const { theme } = useTheme();
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration,
      easing: Easing.inOut(Easing.ease),
    });
  }, [progress, duration, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View
      style={{
        height: 4,
        backgroundColor: theme.colors.textTertiary,
        borderRadius: 2,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
