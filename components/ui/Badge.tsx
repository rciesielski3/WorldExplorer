import React from 'react';
import { View, Text } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import { useTheme } from '../../context/ThemeContext';
import { commonTokens } from '../../theme/tokens';

interface BadgeProps {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
}

export function Badge({ label, icon, variant = 'primary' }: BadgeProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  return (
    <Animated.View
      entering={ZoomIn.springify()}
      style={{
        backgroundColor: getBackgroundColor(),
        borderRadius: 20,
        paddingHorizontal: commonTokens.spacing.sm,
        paddingVertical: commonTokens.spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        gap: commonTokens.spacing.xs,
        alignSelf: 'flex-start',
        ...commonTokens.shadows.sm,
      }}
    >
      {icon && <MaterialCommunityIcons name={icon} size={12} color="#FFFFFF" />}
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: commonTokens.typography.caption.fontSize,
          fontFamily: commonTokens.typography.caption.fontFamily,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
