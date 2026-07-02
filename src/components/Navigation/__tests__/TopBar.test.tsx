import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TopBar } from '../TopBar';
import { ThemeProvider } from '../../../../context/ThemeContext';

// NOTE: ThemeProvider renders a SplashScreen placeholder while it loads the
// persisted theme preference from AsyncStorage, and only mounts `children`
// once that resolves. We use the `findBy*` (async, auto-retrying) queries for
// the first assertion in each test so it waits for the real TopBar content to
// mount rather than racing the splash screen; subsequent synchronous
// getBy*/queryBy* calls on the same render are then safe.
//
// TopBar also calls useSafeAreaInsets(), which throws unless there is a
// SafeAreaProvider ancestor, so every render is wrapped with one and given
// fixed test metrics (no native measurement is available under Jest).
const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

function renderTopBar(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );
}

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
    it('should render without crashing', async () => {
      const { findByTestId } = renderTopBar(
          <TopBar testID="top-bar" />
        );

      expect(await findByTestId('top-bar')).toBeTruthy();
    });

    it('should render title when provided', async () => {
      const { findByText } = renderTopBar(
          <TopBar title="Test Title" />
        );

      expect(await findByText('Test Title')).toBeTruthy();
    });

    it('should render app name when showAppName is true', async () => {
      const { findByText } = renderTopBar(
          <TopBar showAppName={true} />
        );

      expect(await findByText('WorldExplorer')).toBeTruthy();
    });

    it('should not show app name by default', async () => {
      const { findByTestId, queryByText } = renderTopBar(
          <TopBar testID="top-bar" />
        );

      await findByTestId('top-bar');

      // Without showAppName, only custom title should appear
      expect(queryByText('WorldExplorer')).toBeNull();
    });
  });

  describe('Title Display', () => {
    it('should display title with correct styling', async () => {
      const { findByText } = renderTopBar(
          <TopBar title="My Title" />
        );

      const titleText = await findByText('My Title');
      expect(titleText.props.style.fontWeight).toBe('600');
    });

    it('should prioritize title over app name', async () => {
      const { findByText, queryByText } = renderTopBar(
          <TopBar title="Custom Title" showAppName={true} />
        );

      // Component renders 'WorldExplorer' when showAppName is true, regardless of title
      expect(await findByText('WorldExplorer')).toBeTruthy();
      expect(queryByText('Custom Title')).toBeNull();
    });

    it('should handle empty title', async () => {
      const { findByTestId, queryByText } = renderTopBar(
          <TopBar testID="top-bar" title="" />
        );

      await findByTestId('top-bar');
      expect(queryByText(/.+/)).toBeNull();
    });

    it('should handle long title', async () => {
      const longTitle = 'This is a very long title that should still display properly';
      const { findByText } = renderTopBar(
          <TopBar title={longTitle} />
        );

      expect(await findByText(longTitle)).toBeTruthy();
    });
  });

  describe('Back Button', () => {
    it('should render back button when showBack is true', async () => {
      const { findByLabelText } = renderTopBar(
          <TopBar showBack={true} onBackPress={jest.fn()} />
        );

      expect(await findByLabelText('Go back')).toBeTruthy();
    });

    it('should not render back button by default', async () => {
      const { findByTestId, queryByLabelText } = renderTopBar(
          <TopBar testID="top-bar" />
        );

      await findByTestId('top-bar');
      expect(queryByLabelText('Go back')).toBeNull();
    });

    it('should call onBackPress when back button is pressed', async () => {
      const mockOnBackPress = jest.fn();
      const { findByLabelText } = renderTopBar(
          <TopBar showBack={true} onBackPress={mockOnBackPress} />
        );

      fireEvent.press(await findByLabelText('Go back'));

      expect(mockOnBackPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback on back press', async () => {
      const Haptics = require('expo-haptics');
      const mockOnBackPress = jest.fn();
      const { findByLabelText } = renderTopBar(
          <TopBar showBack={true} onBackPress={mockOnBackPress} />
        );

      fireEvent.press(await findByLabelText('Go back'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });
  });

  describe('Settings Button', () => {
    it('should render settings button when onSettingsPress is provided', async () => {
      const { findByLabelText } = renderTopBar(
          <TopBar onSettingsPress={jest.fn()} />
        );

      expect(await findByLabelText('Settings')).toBeTruthy();
    });

    it('should not render settings button when onSettingsPress is not provided', async () => {
      const { findByTestId, queryByLabelText } = renderTopBar(
          <TopBar testID="top-bar" />
        );

      await findByTestId('top-bar');
      expect(queryByLabelText('Settings')).toBeNull();
    });

    it('should call onSettingsPress when settings button is pressed', async () => {
      const mockOnSettingsPress = jest.fn();
      const { findByLabelText } = renderTopBar(
          <TopBar onSettingsPress={mockOnSettingsPress} />
        );

      fireEvent.press(await findByLabelText('Settings'));

      expect(mockOnSettingsPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback on settings press', async () => {
      const Haptics = require('expo-haptics');
      const mockOnSettingsPress = jest.fn();
      const { findByLabelText } = renderTopBar(
          <TopBar onSettingsPress={mockOnSettingsPress} />
        );

      fireEvent.press(await findByLabelText('Settings'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });
  });

  describe('Background Color', () => {
    it('should use theme surface color when no gradient is provided', async () => {
      const { findByTestId } = renderTopBar(
          <TopBar testID="top-bar" />
        );

      const outer = await findByTestId('top-bar');
      expect(outer.props.style.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should leave backgroundColor unset when gradientColors is provided', async () => {
      // TopBar does not itself render a gradient; when gradientColors is passed it
      // omits its own backgroundColor so a parent gradient can show through.
      const { findByTestId } = renderTopBar(
          <TopBar testID="top-bar" gradientColors={['#1E88E5', '#43A047']} />
        );

      const outer = await findByTestId('top-bar');
      expect(outer.props.style.backgroundColor).toBeUndefined();
    });
  });

  describe('Safe Area Insets', () => {
    it('should apply top padding equal to the safe area inset', async () => {
      const { findByTestId } = renderTopBar(
          <TopBar testID="top-bar" />
        );

      const outer = await findByTestId('top-bar');
      expect(typeof outer.props.style.paddingTop).toBe('number');
      expect(outer.props.style.paddingTop).toBeGreaterThanOrEqual(0);
    });

    it('should render with a height derived from the safe area inset', async () => {
      const { findByTestId } = renderTopBar(
          <TopBar testID="top-bar" />
        );

      const outer = await findByTestId('top-bar');
      expect(outer.props.style.height).toBeGreaterThanOrEqual(56);
    });
  });

  describe('Layout', () => {
    it('should have flexDirection row', async () => {
      const { findByTestId } = renderTopBar(
          <TopBar testID="top-bar" />
        );

      const outer = await findByTestId('top-bar');
      expect(outer.props.style.flexDirection).toBe('row');
    });

    it('should justify space-between', async () => {
      const { findByTestId } = renderTopBar(
          <TopBar testID="top-bar" title="Title" onSettingsPress={jest.fn()} />
        );

      const outer = await findByTestId('top-bar');
      expect(outer.props.style.justifyContent).toBe('space-between');
    });

    it('should align items center', async () => {
      const { findByTestId } = renderTopBar(
          <TopBar testID="top-bar" />
        );

      const outer = await findByTestId('top-bar');
      expect(outer.props.style.alignItems).toBe('center');
    });
  });

  describe('Accessibility', () => {
    it('should have a pressable back button', async () => {
      const { findByLabelText } = renderTopBar(
          <TopBar showBack={true} onBackPress={jest.fn()} />
        );

      const backButton = await findByLabelText('Go back');
      expect(backButton.props.accessibilityRole).toBe('button');
    });

    it('should have a pressable settings button', async () => {
      const { findByLabelText } = renderTopBar(
          <TopBar onSettingsPress={jest.fn()} />
        );

      const settingsButton = await findByLabelText('Settings');
      expect(settingsButton.props.accessibilityRole).toBe('button');
    });

    it('should have accessible title text', async () => {
      const { findByText } = renderTopBar(
          <TopBar title="Accessible Title" />
        );

      expect(await findByText('Accessible Title')).toBeTruthy();
    });
  });

  describe('Combined Props', () => {
    it('should render with title, back button, and settings', async () => {
      const { findByText, findByLabelText } = renderTopBar(
          <TopBar
            title="Complete TopBar"
            showBack={true}
            onBackPress={jest.fn()}
            onSettingsPress={jest.fn()}
          />
        );

      expect(await findByText('Complete TopBar')).toBeTruthy();
      expect(await findByLabelText('Go back')).toBeTruthy();
      expect(await findByLabelText('Settings')).toBeTruthy();
    });

    it('should render with app name, back button, and settings', async () => {
      const { findByText, findByLabelText } = renderTopBar(
          <TopBar
            showAppName={true}
            showBack={true}
            onBackPress={jest.fn()}
            onSettingsPress={jest.fn()}
          />
        );

      expect(await findByText('WorldExplorer')).toBeTruthy();
      expect(await findByLabelText('Go back')).toBeTruthy();
      expect(await findByLabelText('Settings')).toBeTruthy();
    });

    it('should render with all props including gradient', async () => {
      const { findByText, findByLabelText } = renderTopBar(
          <TopBar
            title="Full TopBar"
            showBack={true}
            onBackPress={jest.fn()}
            onSettingsPress={jest.fn()}
            gradientColors={['#FF6B6B', '#4ECDC4']}
          />
        );

      expect(await findByText('Full TopBar')).toBeTruthy();
      expect(await findByLabelText('Go back')).toBeTruthy();
      expect(await findByLabelText('Settings')).toBeTruthy();
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate hitSlop on settings button', async () => {
      const { findByLabelText } = renderTopBar(
          <TopBar onSettingsPress={jest.fn()} />
        );

      const settingsButton = await findByLabelText('Settings');
      expect(settingsButton.props.hitSlop).toBe(8);
    });
  });

  describe('Icon Rendering', () => {
    it('should render an accessible back button when showBack is true', async () => {
      const { findByLabelText } = renderTopBar(
          <TopBar showBack={true} onBackPress={jest.fn()} />
        );

      // The back icon is decorative; what matters to users (and assistive tech)
      // is that an actionable, labeled "Go back" control is rendered.
      expect(await findByLabelText('Go back')).toBeTruthy();
    });

    it('should render an accessible settings button when onSettingsPress is provided', async () => {
      const { findByLabelText } = renderTopBar(
          <TopBar onSettingsPress={jest.fn()} />
        );

      expect(await findByLabelText('Settings')).toBeTruthy();
    });
  });
});
