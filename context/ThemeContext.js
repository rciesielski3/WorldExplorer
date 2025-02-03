import React from "react";
import { View } from "react-native";

import { styles } from "../styles";

export const ThemeContext = React.createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <View style={styles.container}>{children}</View>
    </ThemeContext.Provider>
  );
};
