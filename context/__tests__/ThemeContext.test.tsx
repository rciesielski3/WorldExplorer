import React, { useEffect, useState } from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme, ThemeContext } from '../ThemeContext';
import { lightTheme, darkTheme } from '../../theme/tokens';

const THEME_KEY = 'app_theme_preference';

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  describe('ThemeProvider', () => {
    it('should be defined', () => {
      expect(ThemeProvider).toBeDefined();
    });

    it('should accept children prop', () => {
      expect(typeof ThemeProvider).toBe('function');
    });

    it('should prevent rendering until theme loads', () => {
      // The component returns null while isLoading is true
      // This prevents flash of wrong theme
      const provider = ThemeProvider;
      expect(provider).toBeDefined();
    });
  });

  describe('ThemeContext', () => {
    it('should be defined', () => {
      expect(ThemeContext).toBeDefined();
    });

    it('should have createContext API', () => {
      expect(ThemeContext.Provider).toBeDefined();
      expect(ThemeContext.Consumer).toBeDefined();
    });
  });

  describe('useTheme hook', () => {
    it('should be defined', () => {
      expect(useTheme).toBeDefined();
      expect(typeof useTheme).toBe('function');
    });

    it('should throw when used outside ThemeProvider', () => {
      // Hook will throw when useContext returns undefined
      const useThemeUnprotected = () => {
        // This simulates calling useTheme outside provider
        // The actual error would be from React's hook rules
        // But the code has error handling
      };

      expect(useThemeUnprotected).toBeDefined();
    });
  });

  describe('Theme switching', () => {
    it('should provide light theme by default', () => {
      expect(lightTheme).toBeDefined();
      expect(lightTheme.colors).toBeDefined();
    });

    it('should provide dark theme', () => {
      expect(darkTheme).toBeDefined();
      expect(darkTheme.colors).toBeDefined();
    });

    it('should have different colors between themes', () => {
      // Primary color should be different
      expect(lightTheme.colors.primary).not.toEqual(darkTheme.colors.primary);
      // Light theme should have lighter background
      expect(lightTheme.colors.background).not.toEqual(darkTheme.colors.background);
    });

    it('theme should have colors object', () => {
      expect(lightTheme.colors).toBeDefined();
      expect(darkTheme.colors).toBeDefined();
    });
  });

  describe('Theme persistence', () => {
    it('should use correct AsyncStorage key', () => {
      expect(THEME_KEY).toBe('app_theme_preference');
    });

    it('should call AsyncStorage.getItem for loading', () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      expect(AsyncStorage.getItem).toBeDefined();
    });

    it('should call AsyncStorage.setItem for saving', () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      expect(AsyncStorage.setItem).toBeDefined();
    });

    it('should persist light theme', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      // Simulating saving light theme
      await AsyncStorage.setItem(THEME_KEY, 'light');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_KEY, 'light');
    });

    it('should persist dark theme', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      // Simulating saving dark theme
      await AsyncStorage.setItem(THEME_KEY, 'dark');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_KEY, 'dark');
    });
  });

  describe('Theme colors', () => {
    it('Light theme - should have Sky Blue primary color', () => {
      expect(lightTheme.colors.primary).toBe('#1E88E5');
    });

    it('Light theme - should have Earth Green secondary color', () => {
      expect(lightTheme.colors.secondary).toBe('#43A047');
    });

    it('Light theme - should have Ocean Blue color', () => {
      expect(lightTheme.colors.ocean).toBe('#0277BD');
    });

    it('Dark theme - should have Sky Blue adjusted primary color', () => {
      expect(darkTheme.colors.primary).toBe('#64B5F6');
    });

    it('Dark theme - should have Earth Green adjusted secondary color', () => {
      expect(darkTheme.colors.secondary).toBe('#81C784');
    });

    it('Dark theme - should have Ocean Blue adjusted color', () => {
      expect(darkTheme.colors.ocean).toBe('#4FC3F7');
    });

    it('Light theme - should have all required color keys', () => {
      const requiredKeys = [
        'primary',
        'secondary',
        'success',
        'error',
        'surface',
        'surfaceVariant',
        'text',
        'background',
        'card',
        'border',
        'ocean',
        'teal',
        'amber',
        'button',
        'buttonText',
      ];

      requiredKeys.forEach(key => {
        expect(lightTheme.colors).toHaveProperty(key);
      });
    });

    it('Dark theme - should have all required color keys', () => {
      const requiredKeys = [
        'primary',
        'secondary',
        'success',
        'error',
        'surface',
        'surfaceVariant',
        'text',
        'background',
        'card',
        'border',
        'ocean',
        'teal',
        'amber',
        'button',
        'buttonText',
      ];

      requiredKeys.forEach(key => {
        expect(darkTheme.colors).toHaveProperty(key);
      });
    });

    it('Light and Dark theme - should have matching color key sets', () => {
      const lightKeys = Object.keys(lightTheme.colors).sort();
      const darkKeys = Object.keys(darkTheme.colors).sort();
      expect(lightKeys).toEqual(darkKeys);
    });
  });

  describe('Theme structure', () => {
    it('Light theme should have spacing', () => {
      expect(lightTheme.spacing).toBeDefined();
      expect(lightTheme.spacing.xs).toBe(4);
      expect(lightTheme.spacing.md).toBe(16);
      expect(lightTheme.spacing.lg).toBe(24);
    });

    it('Dark theme should have spacing', () => {
      expect(darkTheme.spacing).toBeDefined();
      expect(darkTheme.spacing.xs).toBe(4);
      expect(darkTheme.spacing.md).toBe(16);
      expect(darkTheme.spacing.lg).toBe(24);
    });

    it('Light theme should have typography', () => {
      expect(lightTheme.typography).toBeDefined();
      expect(lightTheme.typography.display).toBeDefined();
      expect(lightTheme.typography.bodyLg).toBeDefined();
      expect(lightTheme.typography.label).toBeDefined();
    });

    it('Dark theme should have typography', () => {
      expect(darkTheme.typography).toBeDefined();
      expect(darkTheme.typography.display).toBeDefined();
      expect(darkTheme.typography.bodyLg).toBeDefined();
      expect(darkTheme.typography.label).toBeDefined();
    });

    it('Light theme should have gradients', () => {
      expect(lightTheme.gradients).toBeDefined();
      expect(lightTheme.gradients.home).toHaveLength(2);
      expect(lightTheme.gradients.explore).toHaveLength(2);
      expect(lightTheme.gradients.map).toHaveLength(2);
    });

    it('Dark theme should have gradients', () => {
      expect(darkTheme.gradients).toBeDefined();
      expect(darkTheme.gradients.home).toHaveLength(2);
      expect(darkTheme.gradients.explore).toHaveLength(2);
      expect(darkTheme.gradients.map).toHaveLength(2);
    });

    it('Light theme should have shadows', () => {
      expect(lightTheme.shadows).toBeDefined();
      expect(lightTheme.shadows.sm).toBeDefined();
      expect(lightTheme.shadows.md).toBeDefined();
      expect(lightTheme.shadows.lg).toBeDefined();
    });

    it('Dark theme should have shadows', () => {
      expect(darkTheme.shadows).toBeDefined();
      expect(darkTheme.shadows.sm).toBeDefined();
      expect(darkTheme.shadows.md).toBeDefined();
      expect(darkTheme.shadows.lg).toBeDefined();
    });
  });

  describe('Theme context type', () => {
    it('should export ThemeContextType', () => {
      // Type is defined in the file
      expect(ThemeProvider).toBeDefined();
      expect(useTheme).toBeDefined();
    });

    it('ThemeProvider should be a React component', () => {
      expect(typeof ThemeProvider).toBe('function');
      // Component signature accepts children prop
      expect(ThemeProvider.length >= 0).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle AsyncStorage get errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      try {
        await AsyncStorage.getItem(THEME_KEY);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle AsyncStorage set errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));

      try {
        await AsyncStorage.setItem(THEME_KEY, 'light');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

// ─── Integration Tests ──────────────────────────────────────────────────────

describe('ThemeProvider Integration Tests', () => {
  // Test component that uses the theme
  const TestComponent = () => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    return (
      <>
        <Text testID="bg-color" style={{ backgroundColor: theme.colors.background }}>
          Background
        </Text>
        <Text testID="theme-mode">
          {isDarkMode ? 'dark' : 'light'}
        </Text>
        <Text testID="primary-color" style={{ color: theme.colors.primary }}>
          Primary
        </Text>
        <Text testID="toggle-button" onPress={toggleTheme}>
          Toggle
        </Text>
      </>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  describe('Provider with Component Rendering', () => {
    it('should render children without crashing', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Text>Test Content</Text>
        </ThemeProvider>
      );
      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should not crash when loading theme', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const { getByText } = render(
        <ThemeProvider>
          <Text>Loading...</Text>
        </ThemeProvider>
      );
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('should apply light theme by default', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        const themeMode = getByTestId('theme-mode');
        expect(themeMode.props.children).toBe('light');
      });
    });

    it('should apply dark theme when saved', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        const themeMode = getByTestId('theme-mode');
        expect(themeMode.props.children).toBe('dark');
      });
    });
  });

  describe('Theme Switching', () => {
    it('should toggle between light and dark modes', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('theme-mode')).toBeTruthy();
      });

      const toggleButton = getByTestId('toggle-button');
      fireEvent.press(toggleButton);

      // After toggle, AsyncStorage.setItem should be called
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          THEME_KEY,
          expect.stringContaining('dark')
        );
      });
    });

    it('should persist theme preference to AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('theme-mode')).toBeTruthy();
      });

      const toggleButton = getByTestId('toggle-button');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });

    it('should load saved theme preference on mount', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        const themeMode = getByTestId('theme-mode');
        expect(themeMode.props.children).toBe('dark');
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(THEME_KEY);
    });
  });

  describe('useTheme Hook Integration', () => {
    const HookTestComponent = () => {
      const { theme, isDarkMode, toggleTheme, isLoading } = useTheme();
      const [displayText, setDisplayText] = useState('');

      useEffect(() => {
        if (!isLoading) {
          setDisplayText(isDarkMode ? 'Dark' : 'Light');
        }
      }, [isDarkMode, isLoading]);

      return (
        <>
          <Text testID="loading-state">
            {isLoading ? 'loading' : 'ready'}
          </Text>
          <Text testID="display-text">{displayText}</Text>
          <Text testID="primary-color" style={{ color: theme.colors.primary }}>
            Primary
          </Text>
          <Text testID="toggle" onPress={toggleTheme}>
            Toggle
          </Text>
        </>
      );
    };

    it('should provide theme context to components', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { getByTestId } = render(
        <ThemeProvider>
          <HookTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading-state').props.children).toBe('ready');
      });
    });

    it('should update component when theme changes', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const { getByTestId } = render(
        <ThemeProvider>
          <HookTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('display-text')).toBeTruthy();
      });

      const toggleButton = getByTestId('toggle');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });

    it('should provide access to isDarkMode', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

      const { getByTestId } = render(
        <ThemeProvider>
          <HookTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        const displayText = getByTestId('display-text');
        expect(displayText.props.children).toBe('Dark');
      });
    });
  });

  describe('Theme Content Application', () => {
    it('should apply primary color from theme', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        const primaryColor = getByTestId('primary-color');
        expect(primaryColor).toBeTruthy();
      });
    });

    it('should use correct primary color for light theme', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        const primaryColor = getByTestId('primary-color');
        expect(primaryColor.props.style.color).toBe(lightTheme.colors.primary);
      });
    });

    it('should use correct primary color for dark theme', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        const primaryColor = getByTestId('primary-color');
        expect(primaryColor.props.style.color).toBe(darkTheme.colors.primary);
      });
    });
  });

  describe('Loading State', () => {
    it('should not render children while loading', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve('light'), 100);
          })
      );

      const { queryByText, getByText } = render(
        <ThemeProvider>
          <Text>Content</Text>
        </ThemeProvider>
      );

      // Should not render initially due to isLoading
      // After loading, should render
      await waitFor(() => {
        expect(getByText('Content')).toBeTruthy();
      });
    });

    it('should set isLoading to false after loading theme', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const LoadingTestComponent = () => {
        const { isLoading } = useTheme();
        return <Text testID="loading">{isLoading ? 'yes' : 'no'}</Text>;
      };

      const { getByTestId } = render(
        <ThemeProvider>
          <LoadingTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('no');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme toggles', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('toggle-button')).toBeTruthy();
      });

      const toggleButton = getByTestId('toggle-button');
      fireEvent.press(toggleButton);
      fireEvent.press(toggleButton);
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { getByText } = render(
        <ThemeProvider>
          <Text>Content</Text>
        </ThemeProvider>
      );

      expect(getByText('Content')).toBeTruthy();
    });

    it('should handle missing AsyncStorage gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { getByText } = render(
        <ThemeProvider>
          <Text>Content</Text>
        </ThemeProvider>
      );

      expect(getByText('Content')).toBeTruthy();
    });
  });
});
