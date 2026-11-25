import React from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { useTheme } from "../../../context/ThemeContext";
import { commonTokens } from "../../../theme/tokens";
import { NavBarIcon } from "./NavBarIcon";

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
  testID = "floating-nav-bar",
}: FloatingNavBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const colors = theme.colors;

  // No dedicated "surfaceOverlay" design token exists yet (see theme/tokens.ts).
  // Named constant (not an inline literal) applies a 95% opacity hex suffix
  // (0xF2 = 242/255 ≈ 95%) to the surface token for the translucent nav bar.
  const navBarBackgroundColor = `${colors.surface}F2`;

  // Side offsets clear display cutouts / system bars in landscape. On wide
  // screens the bar is capped to the shared content width and stays centered
  // by growing both offsets equally.
  const sideLeft = commonTokens.spacing.lg + insets.left;
  const sideRight = commonTokens.spacing.lg + insets.right;
  const extra = Math.max(
    0,
    (windowWidth - sideLeft - sideRight - commonTokens.layout.maxContentWidth) / 2,
  );

  return (
    <Animated.View
      testID={testID}
      style={{
        position: "absolute",
        bottom: insets.bottom + 16,
        left: sideLeft + extra,
        right: sideRight + extra,
        height: 56,
        borderRadius: 28,
        backgroundColor: navBarBackgroundColor,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 1000,
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
          testID={`${testID}-item-${item.name}`}
        />
      ))}
    </Animated.View>
  );
}
