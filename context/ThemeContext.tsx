import React, { ReactNode } from "react";

type Theme = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    card: string;
    button: string;
    buttonText: string;
    border: string;
  };
};

type ThemeContextType = {
  theme: Theme;
};

type ThemeProviderProps = {
  children: ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined,
);

export const ThemeProvider = ({
  children,
  isDarkMode,
  toggleTheme,
}: ThemeProviderProps) => {
  const theme: Theme = {
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

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};
