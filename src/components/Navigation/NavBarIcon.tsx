import React from 'react';
import { Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../context/ThemeContext';
import { commonTokens } from '../../../theme/tokens';

interface NavBarIconProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
  color: string;
  accessibilityLabel?: string;
  testID?: string;
}

export function NavBarIcon({ name, isActive, onPress, color, accessibilityLabel, testID }: NavBarIconProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={{ flex: 1, alignItems: 'center', padding: commonTokens.spacing.sm }}
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
