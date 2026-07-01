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
  testID?: string;
}

export function FloatingNavBar({
  currentRoute,
  onNavigate,
  items,
  testID = 'floating-nav-bar'
}: FloatingNavBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = theme.colors;

  // No dedicated "surfaceOverlay" design token exists yet (see theme/tokens.ts).
  // Named constant (not an inline literal) applies a 95% opacity hex suffix
  // (0xF2 = 242/255 ≈ 95%) to the surface token for the translucent nav bar.
  const navBarBackgroundColor = `${colors.surface}F2`;

  return (
    <Animated.View
      testID={testID}
      style={{
        position: 'absolute',
        bottom: insets.bottom + 16,
        left: 24,
        right: 24,
        height: 56,
        borderRadius: 28,
        backgroundColor: navBarBackgroundColor,
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
