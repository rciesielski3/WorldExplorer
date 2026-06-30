// context/ThemeContext.tsx
import React, {
  ReactNode,
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, type Theme } from '../theme/tokens';

// ─── Storage key ───────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = 'app_theme_preference';

// ─── Types ─────────────────────────────────────────────────────────────────

export type ThemeContextType = {
  /** Full theme object (colors, gradients, isDarkMode, toggleTheme) */
  theme: Theme;
  /** Convenience shortcut — same as theme.isDarkMode */
  isDarkMode: boolean;
  /** Convenience shortcut — same as theme.toggleTheme */
  toggleTheme: () => void;
  /** True while the saved preference is being read from storage */
  isLoading: boolean;
};

// ─── Context ───────────────────────────────────────────────────────────────

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  /**
   * True once the user has explicitly toggled the theme.
   * While false, system-preference changes are respected.
   */
  const [hasCustomPreference, setHasCustomPreference] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!mounted) return;

        if (saved !== null) {
          setIsDarkMode(saved === 'dark');
          setHasCustomPreference(true);
        } else {
          // No saved preference — follow system
          setIsDarkMode(systemScheme === 'dark');
        }
      } catch (err) {
        if (!mounted) return;
        console.warn('[ThemeProvider] Failed to load theme preference:', err);
        setIsDarkMode(systemScheme === 'dark');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadTheme();
    return () => { mounted = false; };
    // Run only once on mount; systemScheme is intentionally excluded here
    // (initial system value captured at mount time via closure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirror system preference changes while no custom preference is set
  useEffect(() => {
    if (!isLoading && !hasCustomPreference) {
      setIsDarkMode(systemScheme === 'dark');
    }
  }, [systemScheme, isLoading, hasCustomPreference]);

  const toggleTheme = useCallback(async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    setHasCustomPreference(true);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch (err) {
      console.warn('[ThemeProvider] Failed to save theme preference:', err);
    }
  }, [isDarkMode]);

  const activeTheme = isDarkMode ? darkTheme : lightTheme;

  const theme: Theme = {
    colors: activeTheme.colors,
    gradients: activeTheme.gradients,
    isDarkMode,
    toggleTheme,
  };

  const value: ThemeContextType = {
    theme,
    isDarkMode,
    toggleTheme,
    isLoading,
  };

  // Render nothing while loading to prevent theme flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be called within <ThemeProvider>');
  }
  return ctx;
};
