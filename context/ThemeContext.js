import React from "react";
import { View, ImageBackground } from "react-native";
import { getStyles } from "../styles";

export const ThemeContext = React.createContext();

export const ThemeProvider = ({ children, isDarkMode, toggleTheme }) => {
  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode
      ? {
          background: "#1C1B29",
          text: "#E4E6EB",
          card: "#3e3a59",
          button: "#31196b",
          buttonText: "#FFFFFF",
          border: "#3A3B44",
        }
      : {
          background: "#F3F4F6",
          text: "#1F2933",
          card: "#8a8cf2",
          button: "#6366F1",
          buttonText: "#000000",
          border: "#D1D5DB",
        },
  };

  const styles = getStyles(theme);

  return (
    <ThemeContext.Provider value={{ theme }}>
      <ImageBackground
        source={require("../assets/worldMapBackground.png")}
        style={styles.backgroundImage}
      >
        {children}
      </ImageBackground>
    </ThemeContext.Provider>
  );
};
