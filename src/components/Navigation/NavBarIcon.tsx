import React from 'react';
import { Pressable } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

interface NavBarIconProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
  color: string;
}

export function NavBarIcon({ name, isActive, onPress, color }: NavBarIconProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{ flex: 1, alignItems: 'center', padding: theme.spacing.sm }}
    >
      <MaterialCommunityIcons
        name={name}
        size={24}
        color={isActive ? color : theme.colors.textSecondary}
        style={{ fontWeight: isActive ? '700' : '400' }}
      />
    </Pressable>
  );
}
