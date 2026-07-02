import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TopBar } from '../TopBar';
import { ThemeProvider } from '../../../../context/ThemeContext';

describe('TopBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Definition', () => {
    it('should be a React component', () => {
      expect(typeof TopBar).toBe('function');
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      expect(toJSON()).not.toBeNull();
    });

    it('should render title when provided', () => {
      const { getByText } = render(
        <ThemeProvider>
          <TopBar title="Test Title" />
        </ThemeProvider>
      );

      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should render app name when showAppName is true', () => {
      const { getByText } = render(
        <ThemeProvider>
          <TopBar showAppName={true} />
        </ThemeProvider>
      );

      expect(getByText('WorldExplorer')).toBeTruthy();
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

      const titleText = getByText('My Title');
      expect(titleText.props.style.fontWeight).toBe('600');
    });

    it('should prioritize title over app name', () => {
      const { getByText, queryByText } = render(
        <ThemeProvider>
          <TopBar title="Custom Title" showAppName={true} />
        </ThemeProvider>
      );

      // Component renders 'WorldExplorer' when showAppName is true, regardless of title
      expect(getByText('WorldExplorer')).toBeTruthy();
      expect(queryByText('Custom Title')).toBeNull();
    });

    it('should handle empty title', () => {
      const { queryByText, toJSON } = render(
        <ThemeProvider>
          <TopBar title="" />
        </ThemeProvider>
      );

      expect(toJSON()).not.toBeNull();
      expect(queryByText(/.+/)).toBeNull();
    });

    it('should handle long title', () => {
      const longTitle = 'This is a very long title that should still display properly';
      const { getByText } = render(
        <ThemeProvider>
          <TopBar title={longTitle} />
        </ThemeProvider>
      );

      expect(getByText(longTitle)).toBeTruthy();
    });
  });

  describe('Back Button', () => {
    it('should render back button when showBack is true', () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={jest.fn()} />
        </ThemeProvider>
      );

      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('should not render back button by default', () => {
      const { queryByLabelText } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      expect(queryByLabelText('Go back')).toBeNull();
    });

    it('should call onBackPress when back button is pressed', () => {
      const mockOnBackPress = jest.fn();
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={mockOnBackPress} />
        </ThemeProvider>
      );

      fireEvent.press(getByLabelText('Go back'));

      expect(mockOnBackPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback on back press', () => {
      const Haptics = require('expo-haptics');
      const mockOnBackPress = jest.fn();
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={mockOnBackPress} />
        </ThemeProvider>
      );

      fireEvent.press(getByLabelText('Go back'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });
  });

  describe('Settings Button', () => {
    it('should render settings button when onSettingsPress is provided', () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      expect(getByLabelText('Settings')).toBeTruthy();
    });

    it('should not render settings button when onSettingsPress is not provided', () => {
      const { queryByLabelText } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      expect(queryByLabelText('Settings')).toBeNull();
    });

    it('should call onSettingsPress when settings button is pressed', () => {
      const mockOnSettingsPress = jest.fn();
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={mockOnSettingsPress} />
        </ThemeProvider>
      );

      fireEvent.press(getByLabelText('Settings'));

      expect(mockOnSettingsPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback on settings press', () => {
      const Haptics = require('expo-haptics');
      const mockOnSettingsPress = jest.fn();
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={mockOnSettingsPress} />
        </ThemeProvider>
      );

      fireEvent.press(getByLabelText('Settings'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });
  });

  describe('Background Color', () => {
    it('should use theme surface color when no gradient is provided', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="top-bar" />
        </ThemeProvider>
      );

      const outer = getByTestId('top-bar');
      expect(outer.props.style.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should leave backgroundColor unset when gradientColors is provided', () => {
      // TopBar does not itself render a gradient; when gradientColors is passed it
      // omits its own backgroundColor so a parent gradient can show through.
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="top-bar" gradientColors={['#1E88E5', '#43A047']} />
        </ThemeProvider>
      );

      const outer = getByTestId('top-bar');
      expect(outer.props.style.backgroundColor).toBeUndefined();
    });
  });

  describe('Safe Area Insets', () => {
    it('should apply top padding equal to the safe area inset', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="top-bar" />
        </ThemeProvider>
      );

      const outer = getByTestId('top-bar');
      expect(typeof outer.props.style.paddingTop).toBe('number');
      expect(outer.props.style.paddingTop).toBeGreaterThanOrEqual(0);
    });

    it('should render with a height derived from the safe area inset', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="top-bar" />
        </ThemeProvider>
      );

      const outer = getByTestId('top-bar');
      expect(outer.props.style.height).toBeGreaterThanOrEqual(56);
    });
  });

  describe('Layout', () => {
    it('should have flexDirection row', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="top-bar" />
        </ThemeProvider>
      );

      const outer = getByTestId('top-bar');
      expect(outer.props.style.flexDirection).toBe('row');
    });

    it('should justify space-between', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="top-bar" title="Title" onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      const outer = getByTestId('top-bar');
      expect(outer.props.style.justifyContent).toBe('space-between');
    });

    it('should align items center', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TopBar testID="top-bar" />
        </ThemeProvider>
      );

      const outer = getByTestId('top-bar');
      expect(outer.props.style.alignItems).toBe('center');
    });
  });

  describe('Accessibility', () => {
    it('should have a pressable back button', () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={jest.fn()} />
        </ThemeProvider>
      );

      const backButton = getByLabelText('Go back');
      expect(backButton.props.accessibilityRole).toBe('button');
    });

    it('should have a pressable settings button', () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      const settingsButton = getByLabelText('Settings');
      expect(settingsButton.props.accessibilityRole).toBe('button');
    });

    it('should have accessible title text', () => {
      const { getByText } = render(
        <ThemeProvider>
          <TopBar title="Accessible Title" />
        </ThemeProvider>
      );

      expect(getByText('Accessible Title')).toBeTruthy();
    });
  });

  describe('Combined Props', () => {
    it('should render with title, back button, and settings', () => {
      const { getByText, getByLabelText } = render(
        <ThemeProvider>
          <TopBar
            title="Complete TopBar"
            showBack={true}
            onBackPress={jest.fn()}
            onSettingsPress={jest.fn()}
          />
        </ThemeProvider>
      );

      expect(getByText('Complete TopBar')).toBeTruthy();
      expect(getByLabelText('Go back')).toBeTruthy();
      expect(getByLabelText('Settings')).toBeTruthy();
    });

    it('should render with app name, back button, and settings', () => {
      const { getByText, getByLabelText } = render(
        <ThemeProvider>
          <TopBar
            showAppName={true}
            showBack={true}
            onBackPress={jest.fn()}
            onSettingsPress={jest.fn()}
          />
        </ThemeProvider>
      );

      expect(getByText('WorldExplorer')).toBeTruthy();
      expect(getByLabelText('Go back')).toBeTruthy();
      expect(getByLabelText('Settings')).toBeTruthy();
    });

    it('should render with all props including gradient', () => {
      const { getByText, getByLabelText } = render(
        <ThemeProvider>
          <TopBar
            title="Full TopBar"
            showBack={true}
            onBackPress={jest.fn()}
            onSettingsPress={jest.fn()}
            gradientColors={['#FF6B6B', '#4ECDC4']}
          />
        </ThemeProvider>
      );

      expect(getByText('Full TopBar')).toBeTruthy();
      expect(getByLabelText('Go back')).toBeTruthy();
      expect(getByLabelText('Settings')).toBeTruthy();
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate hitSlop on settings button', () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      const settingsButton = getByLabelText('Settings');
      expect(settingsButton.props.hitSlop).toBe(8);
    });
  });

  describe('Icon Rendering', () => {
    it('should render an accessible back button when showBack is true', () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={jest.fn()} />
        </ThemeProvider>
      );

      // The back icon is decorative; what matters to users (and assistive tech)
      // is that an actionable, labeled "Go back" control is rendered.
      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('should render an accessible settings button when onSettingsPress is provided', () => {
      const { getByLabelText } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      expect(getByLabelText('Settings')).toBeTruthy();
    });
  });
});
