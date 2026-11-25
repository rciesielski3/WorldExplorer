import React from "react";
import { StatusBar } from "expo-status-bar";

import { useTheme } from "../../context/ThemeContext";

/**
 * Keeps system status-bar icons legible against the app background: dark icons
 * in the light theme, light icons in the dark theme. Under edge-to-edge the bar
 * itself is transparent, so only the icon style needs to follow the theme.
 */
export const ThemedStatusBar: React.FC = () => {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
};

export default ThemedStatusBar;
