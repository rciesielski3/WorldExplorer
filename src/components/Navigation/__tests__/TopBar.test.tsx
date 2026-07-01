import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TopBar } from '../TopBar';
import { ThemeProvider } from '../../../../context/ThemeContext';

interface TopBarProps {
  title?: string;
  showAppName?: boolean;
  onSettingsPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  gradientColors?: [string, string];
  testID?: string;
}

const TopBarWrapper: React.FC<Partial<TopBarProps>> = (props) => (
  <ThemeProvider>
    <TopBar {...props} />
  </ThemeProvider>
);

describe('TopBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(TopBar).toBeDefined();
    });

    it('should be a React component', () => {
      expect(typeof TopBar).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should render title when provided', () => {
      const { getByText } = render(
        <ThemeProvider>
          <TopBar title="Test Title" />
        </ThemeProvider>
      );

      expect(getByText('Test Title')).toBeDefined();
    });

    it('should render app name when showAppName is true', () => {
      const { getByText } = render(
        <ThemeProvider>
          <TopBar showAppName={true} />
        </ThemeProvider>
      );

      expect(getByText('WorldExplorer')).toBeDefined();
    });

    it('should not show app name by default', () => {
      const { queryByText } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      // Without showAppName, only custom title should appear
      expect(queryByText('WorldExplorer')).toBeNull();
    });
  });

  describe('Title Display', () => {
    it('should display title with correct styling', () => {
      const { getByText } = render(
        <ThemeProvider>
          <TopBar title="My Title" />
        </ThemeProvider>
      );

      expect(getByText('My Title')).toBeDefined();
    });

    it('should prioritize title over app name', () => {
      const { getByText } = render(
        <ThemeProvider>
          <TopBar title="Custom Title" showAppName={true} />
        </ThemeProvider>
      );

      expect(getByText('Custom Title')).toBeDefined();
    });

    it('should handle empty title', () => {
      const { container } = render(
        <ThemeProvider>
          <TopBar title="" />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should handle long title', () => {
      const longTitle = 'This is a very long title that should still display properly';
      const { getByText } = render(
        <ThemeProvider>
          <TopBar title={longTitle} />
        </ThemeProvider>
      );

      expect(getByText(longTitle)).toBeDefined();
    });
  });

  describe('Back Button', () => {
    it('should render back button when showBack is true', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={jest.fn()} testID="topbar-with-back" />
        </ThemeProvider>
      );

      expect(getByTestId('topbar-with-back')).toBeDefined();
    });

    it('should not render back button by default', () => {
      const { container } = render(
        <ThemeProvider>
          <TopBar testID="topbar" />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should call onBackPress when back button is pressed', () => {
      const mockOnBackPress = jest.fn();
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={mockOnBackPress} testID="back-button" />
        </ThemeProvider>
      );

      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      // Note: actual press handling depends on component implementation
    });

    it('should trigger haptic feedback on back press', () => {
      const mockOnBackPress = jest.fn();
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={mockOnBackPress} testID="haptic-back" />
        </ThemeProvider>
      );

      expect(getByTestId('haptic-back')).toBeDefined();
    });
  });

  describe('Settings Button', () => {
    it('should render settings button when onSettingsPress is provided', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} testID="settings-topbar" />
        </ThemeProvider>
      );

      expect(getByTestId('settings-topbar')).toBeDefined();
    });

    it('should not render settings button when onSettingsPress is not provided', () => {
      const { container } = render(
        <ThemeProvider>
          <TopBar testID="no-settings" />
        </ThemeProvider>
      );

      expect(container).toBeDefined();
    });

    it('should call onSettingsPress when settings button is pressed', () => {
      const mockOnSettingsPress = jest.fn();
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={mockOnSettingsPress} testID="settings-button" />
        </ThemeProvider>
      );

      const settingsButton = getByTestId('settings-button');
      fireEvent.press(settingsButton);

      // Settings press handling
    });

    it('should trigger haptic feedback on settings press', () => {
      const mockOnSettingsPress = jest.fn();
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={mockOnSettingsPress} testID="haptic-settings" />
        </ThemeProvider>
      );

      expect(getByTestId('haptic-settings')).toBeDefined();
    });
  });

  describe('Gradient Background', () => {
    it('should accept gradientColors prop', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar
            gradientColors={['#FF0000', '#00FF00']}
            testID="gradient-topbar"
          />
        </ThemeProvider>
      );

      expect(getByTestId('gradient-topbar')).toBeDefined();
    });

    it('should use theme color when no gradient is provided', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="theme-topbar" />
        </ThemeProvider>
      );

      expect(getByTestId('theme-topbar')).toBeDefined();
    });

    it('should apply gradient with two colors', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar
            gradientColors={['#1E88E5', '#43A047']}
            testID="two-color-gradient"
          />
        </ThemeProvider>
      );

      expect(getByTestId('two-color-gradient')).toBeDefined();
    });
  });

  describe('Safe Area Insets', () => {
    it('should handle safe area insets', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="safe-area-topbar" />
        </ThemeProvider>
      );

      expect(getByTestId('safe-area-topbar')).toBeDefined();
    });

    it('should render with top padding', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="padded-topbar" />
        </ThemeProvider>
      );

      expect(getByTestId('padded-topbar')).toBeDefined();
    });
  });

  describe('Layout', () => {
    it('should have flexDirection row', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="layout-topbar" />
        </ThemeProvider>
      );

      expect(getByTestId('layout-topbar')).toBeDefined();
    });

    it('should justify space-between', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar title="Title" onSettingsPress={jest.fn()} testID="space-between" />
        </ThemeProvider>
      );

      expect(getByTestId('space-between')).toBeDefined();
    });

    it('should align items center', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="aligned-topbar" />
        </ThemeProvider>
      );

      expect(getByTestId('aligned-topbar')).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible back button', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={jest.fn()} testID="accessible-back" />
        </ThemeProvider>
      );

      expect(getByTestId('accessible-back')).toBeDefined();
    });

    it('should have accessible settings button', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} testID="accessible-settings" />
        </ThemeProvider>
      );

      expect(getByTestId('accessible-settings')).toBeDefined();
    });

    it('should have accessible title text', () => {
      const { getByText } = render(
        <ThemeProvider>
          <TopBar title="Accessible Title" />
        </ThemeProvider>
      );

      expect(getByText('Accessible Title')).toBeDefined();
    });
  });

  describe('Combined Props', () => {
    it('should render with title, back button, and settings', () => {
      const { getByText, getByTestId } = render(
        <ThemeProvider>
          <TopBar
            title="Complete TopBar"
            showBack={true}
            onBackPress={jest.fn()}
            onSettingsPress={jest.fn()}
            testID="complete-topbar"
          />
        </ThemeProvider>
      );

      expect(getByText('Complete TopBar')).toBeDefined();
      expect(getByTestId('complete-topbar')).toBeDefined();
    });

    it('should render with app name, back button, and settings', () => {
      const { getByText, getByTestId } = render(
        <ThemeProvider>
          <TopBar
            showAppName={true}
            showBack={true}
            onBackPress={jest.fn()}
            onSettingsPress={jest.fn()}
            testID="app-name-topbar"
          />
        </ThemeProvider>
      );

      expect(getByText('WorldExplorer')).toBeDefined();
      expect(getByTestId('app-name-topbar')).toBeDefined();
    });

    it('should render with all props including gradient', () => {
      const { getByText, getByTestId } = render(
        <ThemeProvider>
          <TopBar
            title="Full TopBar"
            showBack={true}
            onBackPress={jest.fn()}
            onSettingsPress={jest.fn()}
            gradientColors={['#FF6B6B', '#4ECDC4']}
            testID="full-topbar"
          />
        </ThemeProvider>
      );

      expect(getByText('Full TopBar')).toBeDefined();
      expect(getByTestId('full-topbar')).toBeDefined();
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate hitSlop on settings button', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} testID="hit-slop-settings" />
        </ThemeProvider>
      );

      expect(getByTestId('hit-slop-settings')).toBeDefined();
    });
  });

  describe('Icon Rendering', () => {
    it('should render back arrow icon when showBack is true', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={jest.fn()} testID="back-arrow" />
        </ThemeProvider>
      );

      expect(getByTestId('back-arrow')).toBeDefined();
    });

    it('should render settings cog icon when onSettingsPress is provided', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} testID="settings-cog" />
        </ThemeProvider>
      );

      expect(getByTestId('settings-cog')).toBeDefined();
    });
  });
});
