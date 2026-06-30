import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { NavBarIcon } from './NavBarIcon';
import { commonTokens } from '../../theme/tokens';

interface NavItem {
  name: string;
  icon: string;
  color: string;
}

interface FloatingNavBarProps {
  currentRoute: string;
  onNavigate: (routeName: string) => void;
  items: NavItem[];
}

export function FloatingNavBar({ currentRoute, onNavigate, items }: FloatingNavBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: insets.bottom + commonTokens.spacing.lg,
        left: commonTokens.spacing.lg,
        right: commonTokens.spacing.lg,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        ...commonTokens.shadows.lg,
      }}
    >
      {items.map((item) => (
        <NavBarIcon
          key={item.name}
          name={item.icon}
          isActive={currentRoute === item.name}
          onPress={() => onNavigate(item.name)}
          color={item.color}
        />
      ))}
    </Animated.View>
  );
}
