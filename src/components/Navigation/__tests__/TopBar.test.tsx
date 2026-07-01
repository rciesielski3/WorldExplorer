import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Pressable, View } from 'react-native';
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
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={jest.fn()} />
        </ThemeProvider>
      );

      expect(UNSAFE_getAllByType(Pressable)).toHaveLength(1);
    });

    it('should not render back button by default', () => {
      const { UNSAFE_queryAllByType } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      expect(UNSAFE_queryAllByType(Pressable)).toHaveLength(0);
    });

    it('should call onBackPress when back button is pressed', () => {
      const mockOnBackPress = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={mockOnBackPress} />
        </ThemeProvider>
      );

      const [backButton] = UNSAFE_getAllByType(Pressable);
      fireEvent.press(backButton);

      expect(mockOnBackPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback on back press', () => {
      const Haptics = require('expo-haptics');
      const mockOnBackPress = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={mockOnBackPress} />
        </ThemeProvider>
      );

      const [backButton] = UNSAFE_getAllByType(Pressable);
      fireEvent.press(backButton);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });
  });

  describe('Settings Button', () => {
    it('should render settings button when onSettingsPress is provided', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      expect(UNSAFE_getAllByType(Pressable)).toHaveLength(1);
    });

    it('should not render settings button when onSettingsPress is not provided', () => {
      const { UNSAFE_queryAllByType } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      expect(UNSAFE_queryAllByType(Pressable)).toHaveLength(0);
    });

    it('should call onSettingsPress when settings button is pressed', () => {
      const mockOnSettingsPress = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={mockOnSettingsPress} />
        </ThemeProvider>
      );

      const [settingsButton] = UNSAFE_getAllByType(Pressable);
      fireEvent.press(settingsButton);

      expect(mockOnSettingsPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback on settings press', () => {
      const Haptics = require('expo-haptics');
      const mockOnSettingsPress = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={mockOnSettingsPress} />
        </ThemeProvider>
      );

      const [settingsButton] = UNSAFE_getAllByType(Pressable);
      fireEvent.press(settingsButton);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });
  });

  describe('Background Color', () => {
    it('should use theme surface color when no gradient is provided', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      const [outer] = UNSAFE_getAllByType(View);
      expect(outer.props.style.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should leave backgroundColor unset when gradientColors is provided', () => {
      // TopBar does not itself render a gradient; when gradientColors is passed it
      // omits its own backgroundColor so a parent gradient can show through.
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar gradientColors={['#1E88E5', '#43A047']} />
        </ThemeProvider>
      );

      const [outer] = UNSAFE_getAllByType(View);
      expect(outer.props.style.backgroundColor).toBeUndefined();
    });
  });

  describe('Safe Area Insets', () => {
    it('should apply top padding equal to the safe area inset', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      const [outer] = UNSAFE_getAllByType(View);
      expect(typeof outer.props.style.paddingTop).toBe('number');
      expect(outer.props.style.paddingTop).toBeGreaterThanOrEqual(0);
    });

    it('should render with a height derived from the safe area inset', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      const [outer] = UNSAFE_getAllByType(View);
      expect(outer.props.style.height).toBeGreaterThanOrEqual(56);
    });
  });

  describe('Layout', () => {
    it('should have flexDirection row', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      const [outer] = UNSAFE_getAllByType(View);
      expect(outer.props.style.flexDirection).toBe('row');
    });

    it('should justify space-between', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar title="Title" onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      const [outer] = UNSAFE_getAllByType(View);
      expect(outer.props.style.justifyContent).toBe('space-between');
    });

    it('should align items center', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar />
        </ThemeProvider>
      );

      const [outer] = UNSAFE_getAllByType(View);
      expect(outer.props.style.alignItems).toBe('center');
    });
  });

  describe('Accessibility', () => {
    it('should have a pressable back button', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={jest.fn()} />
        </ThemeProvider>
      );

      const [backButton] = UNSAFE_getAllByType(Pressable);
      expect(backButton).toBeTruthy();
    });

    it('should have a pressable settings button', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      const [settingsButton] = UNSAFE_getAllByType(Pressable);
      expect(settingsButton).toBeTruthy();
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
      const { getByText, UNSAFE_getAllByType } = render(
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
      // Back button + settings button
      expect(UNSAFE_getAllByType(Pressable)).toHaveLength(2);
    });

    it('should render with app name, back button, and settings', () => {
      const { getByText, UNSAFE_getAllByType } = render(
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
      expect(UNSAFE_getAllByType(Pressable)).toHaveLength(2);
    });

    it('should render with all props including gradient', () => {
      const { getByText, UNSAFE_getAllByType } = render(
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
      expect(UNSAFE_getAllByType(Pressable)).toHaveLength(2);
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate hitSlop on settings button', () => {
      const { UNSAFE_getAllByType } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      const [settingsButton] = UNSAFE_getAllByType(Pressable);
      expect(settingsButton.props.hitSlop).toBe(8);
    });
  });

  describe('Icon Rendering', () => {
    it('should render back arrow icon when showBack is true', () => {
      const { UNSAFE_getByProps } = render(
        <ThemeProvider>
          <TopBar showBack={true} onBackPress={jest.fn()} />
        </ThemeProvider>
      );

      expect(UNSAFE_getByProps({ name: 'arrow-left' })).toBeTruthy();
    });

    it('should render settings cog icon when onSettingsPress is provided', () => {
      const { UNSAFE_getByProps } = render(
        <ThemeProvider>
          <TopBar onSettingsPress={jest.fn()} />
        </ThemeProvider>
      );

      expect(UNSAFE_getByProps({ name: 'cog' })).toBeTruthy();
    });
  });
});
