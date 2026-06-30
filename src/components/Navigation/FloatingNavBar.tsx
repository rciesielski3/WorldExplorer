import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';
import { NavBarIcon } from './NavBarIcon';

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
        bottom: insets.bottom + 16,
        left: 24,
        right: 24,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.isDarkMode
          ? 'rgba(13, 11, 22, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        ...theme.shadows.lg,
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
