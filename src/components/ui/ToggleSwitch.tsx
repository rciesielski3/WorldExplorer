import React from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../context/ThemeContext';

interface ToggleSwitchProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
}

export function ToggleSwitch({ value, onToggle, label }: ToggleSwitchProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(value ? 24 : 0);

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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
      {label && (
        <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.body }}>
          {label}
        </Text>
      )}
      <Pressable
        onPress={handleToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        style={{
          width: 56,
          height: 32,
          borderRadius: 16,
          backgroundColor: value ? theme.colors.primary : theme.colors.surfaceVariant,
          justifyContent: 'center',
          paddingLeft: theme.spacing.xs,
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
            name={value ? 'moon' : 'white-balance-sunny'}
            size={16}
            color={theme.colors.primary}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}
