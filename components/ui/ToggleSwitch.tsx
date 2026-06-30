import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { commonTokens } from '../../theme/tokens';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  enabledIcon?: string;
  disabledIcon?: string;
  accessibilityLabel?: string;
  hapticFeedback?: boolean;
}

export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
  style,
  enabledIcon = 'sun',
  disabledIcon = 'moon',
  accessibilityLabel,
  hapticFeedback = true,
}: ToggleSwitchProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(value ? 20 : 0);
  const rotation = useSharedValue(value ? 0 : 180);

  React.useEffect(() => {
    translateX.value = withSpring(value ? 20 : 0);
    rotation.value = withSpring(value ? 0 : 180);
  }, [value, translateX, rotation]);

  const handlePress = async () => {
    if (!disabled) {
      if (hapticFeedback) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onValueChange(!value);
    }
  };

  const animatedTrackStyle = useAnimatedStyle(() => ({
    backgroundColor: value ? theme.colors.secondary : theme.colors.textTertiary,
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      style={style}
    >
      <Animated.View
        style={[
          {
            width: 56,
            height: 32,
            borderRadius: 16,
            padding: 2,
            flexDirection: 'row',
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1,
          },
          animatedTrackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
              ...commonTokens.shadows.sm,
            },
            animatedThumbStyle,
          ]}
        >
          <Animated.View style={animatedIconStyle}>
            <MaterialCommunityIcons
              name={value ? enabledIcon : disabledIcon}
              size={16}
              color={value ? theme.colors.amber : theme.colors.textSecondary}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
