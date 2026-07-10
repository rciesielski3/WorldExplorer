import React from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../context/ThemeContext';
import { commonTokens } from '../../../theme/tokens';

interface ToggleSwitchProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
  accessibilityLabel?: string;
  /** Icon shown in the thumb when `value` is true. Defaults to the dark-mode "moon" icon. */
  iconOn?: string;
  /** Icon shown in the thumb when `value` is false. Defaults to the dark-mode "sun" icon. */
  iconOff?: string;
  testID?: string;
}

export function ToggleSwitch({
  value,
  onToggle,
  label,
  accessibilityLabel,
  iconOn = 'moon',
  iconOff = 'white-balance-sunny',
  testID,
}: ToggleSwitchProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(value ? 24 : 0);

  React.useEffect(() => {
    translateX.value = withSpring(value ? 24 : 0);
  }, [value, translateX]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !value;
    onToggle(newValue);
    translateX.value = withSpring(newValue ? 24 : 0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: commonTokens.spacing.md }}>
      {label && (
        <Text style={{ color: theme.colors.text, fontSize: commonTokens.typography.bodyMd.fontSize }}>
          {label}
        </Text>
      )}
      <Pressable
        onPress={handleToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        accessibilityLabel={accessibilityLabel || label}
        testID={testID}
        style={{
          width: 56,
          height: 32,
          borderRadius: 16,
          backgroundColor: value ? theme.colors.primary : theme.colors.surfaceVariant,
          justifyContent: 'center',
          paddingLeft: commonTokens.spacing.xs,
          ...theme.shadows.sm,
        }}
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
            },
            animatedStyle,
          ]}
        >
          <MaterialCommunityIcons
            name={value ? iconOn : iconOff}
            size={16}
            color={theme.colors.primary}
            testID={testID ? `${testID}-icon` : undefined}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}
