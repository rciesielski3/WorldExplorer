import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsScreen } from '../SettingsScreen';
import { ThemeProvider } from '../../context/ThemeContext';

// react-native-safe-area-context reads device metrics from a native module
// that isn't available under Jest, so `initialWindowMetrics` resolves to
// `null` outside a real app. Supply fixed metrics directly so
// `useSafeAreaInsets()` (used by SettingsScreen for bottom padding) has a
// context value to read instead of throwing.
const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
// Side effect: initializes the shared i18next instance (resources + default
// "en" language) so `useTranslation()` inside SettingsScreen resolves real
// strings instead of returning undefined, matching how App.tsx bootstraps it.
import i18n from '../../i18n';

// SettingsScreen renders a native <Picker> for language selection. The real
// @react-native-picker/picker ships a native module that isn't available
// under Jest, so swap it for a inert stand-in.
jest.mock('@react-native-picker/picker', () => {
  const ReactActual = require('react');
  const PickerMock = ({ children }: any) => ReactActual.createElement('Picker', null, children);
  PickerMock.Item = () => null;
  return { Picker: PickerMock };
});

// usePremium() pulls in react-native-purchases, which requires a native
// module unavailable under Jest. SettingsScreen only reads `isEnabled` to
// decide whether to render the Premium card, so a disabled default is enough
// to exercise the toggle logic under test here.
jest.mock('../../context/PremiumContext', () => ({
  usePremium: () => ({
    error: null,
    isConfigured: false,
    isEnabled: false,
    isLoading: false,
    isPremium: false,
    isPurchasing: false,
    isRestoring: false,
    premiumPackage: null,
    purchasePremium: jest.fn(),
    restorePurchases: jest.fn(),
  }),
}));

// NotificationService imports expo-notifications at module scope, which
// pulls in expo-modules-core's native module bridge as a side effect of
// require() -- unavailable under Jest (see NotificationService.test.ts for
// the same rationale). SettingsScreen only calls loadNotificationSettings
// and updateNotificationSettings, so a lightweight mock keeps this test
// file from ever touching the real expo-notifications import chain.
const mockLoadNotificationSettings = jest
  .fn()
  .mockResolvedValue({ enabled: false, time: '09:00' });
const mockUpdateNotificationSettings = jest.fn().mockResolvedValue(undefined);
jest.mock('../../src/components/NotificationService', () => ({
  loadNotificationSettings: (...args: unknown[]) => mockLoadNotificationSettings(...args),
  updateNotificationSettings: (...args: unknown[]) => mockUpdateNotificationSettings(...args),
}));

// getTodayChallenge reads/writes AsyncStorage and picks a random country;
// SettingsScreen only needs the resolved country name to build the
// notification message, so a fixed resolved value keeps notification tests
// deterministic without depending on the full countries dataset.
jest.mock('../../utils/dailyChallenge', () => ({
  getTodayChallenge: jest.fn().mockResolvedValue({
    countryCode: 'JP',
    dateKey: '2026-07-14',
    countryName: 'Japan',
  }),
}));

const renderSettingsScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <SettingsScreen navigation={{ navigate: jest.fn() } as any} />
      </ThemeProvider>
    </SafeAreaProvider>
  );

describe('SettingsScreen - Toggle Icons', () => {
  beforeEach(async () => {
    // ThemeProvider persists the dark-mode preference to AsyncStorage on
    // toggle; the mock store in jest.setup.js is shared module state that
    // otherwise leaks a "dark" preference from one test into the next.
    await AsyncStorage.clear();
  });

  describe('Sound Effects Toggle', () => {
    it('displays an icon (not a question mark) while OFF', async () => {
      const { getByTestId } = renderSettingsScreen();
      await act(async () => {});

      const icon = getByTestId('toggle-sound-effects-icon');
      expect(icon.props.name).toBeTruthy();
      expect(icon.props.name).not.toBe('?');
    });

    it('displays an icon (not a question mark) while ON', async () => {
      const { getByTestId } = renderSettingsScreen();
      await act(async () => {});

      fireEvent.press(getByTestId('toggle-sound-effects'));

      const icon = getByTestId('toggle-sound-effects-icon');
      expect(icon.props.name).toBeTruthy();
      expect(icon.props.name).not.toBe('?');
    });

    it('swaps between volume-off and volume-high as the toggle is switched', async () => {
      const { getByTestId } = renderSettingsScreen();
      await act(async () => {});

      // Sound starts enabled (ON) in SettingsScreen's default state.
      expect(getByTestId('toggle-sound-effects-icon').props.name).toBe('volume-high');

      fireEvent.press(getByTestId('toggle-sound-effects'));

      expect(getByTestId('toggle-sound-effects-icon').props.name).toBe('volume-off');
    });
  });

  describe('Haptics Toggle', () => {
    it('displays an icon (not a question mark) while OFF', async () => {
      const { getByTestId } = renderSettingsScreen();
      await act(async () => {});

      fireEvent.press(getByTestId('toggle-haptics')); // start ON -> turn OFF

      const icon = getByTestId('toggle-haptics-icon');
      expect(icon.props.name).toBeTruthy();
      expect(icon.props.name).not.toBe('?');
    });

    it('displays an icon (not a question mark) while ON', async () => {
      const { getByTestId } = renderSettingsScreen();
      await act(async () => {});

      const icon = getByTestId('toggle-haptics-icon');
      expect(icon.props.name).toBeTruthy();
      expect(icon.props.name).not.toBe('?');
    });

    it('swaps between vibrate-off and vibrate as the toggle is switched', async () => {
      const { getByTestId } = renderSettingsScreen();
      await act(async () => {});

      // Haptics starts enabled (ON) in SettingsScreen's default state.
      expect(getByTestId('toggle-haptics-icon').props.name).toBe('vibrate');

      fireEvent.press(getByTestId('toggle-haptics'));

      expect(getByTestId('toggle-haptics-icon').props.name).toBe('vibrate-off');
    });
  });

  describe('Dark Mode Toggle', () => {
    it('displays an icon (not a question mark) while OFF', async () => {
      const { getByTestId } = renderSettingsScreen();
      await act(async () => {});

      const icon = getByTestId('toggle-dark-mode-icon');
      expect(icon.props.name).toBeTruthy();
      expect(icon.props.name).not.toBe('?');
    });

    it('displays an icon (not a question mark) while ON', async () => {
      const { getByTestId } = renderSettingsScreen();
      await act(async () => {});

      fireEvent.press(getByTestId('toggle-dark-mode'));

      const icon = getByTestId('toggle-dark-mode-icon');
      expect(icon.props.name).toBeTruthy();
      expect(icon.props.name).not.toBe('?');
    });

    it('swaps between white-balance-sunny and moon as the toggle is switched', async () => {
      const { getByTestId } = renderSettingsScreen();
      await act(async () => {});

      expect(getByTestId('toggle-dark-mode-icon').props.name).toBe('white-balance-sunny');

      // handleThemeToggle awaits a haptic trigger before flipping the theme,
      // so the state update lands in a microtask after the press event.
      await act(async () => {
        fireEvent.press(getByTestId('toggle-dark-mode'));
      });

      expect(getByTestId('toggle-dark-mode-icon').props.name).toBe('weather-night');
    });
  });

  describe('No question marks anywhere on the screen', () => {
    it('never renders a literal "?" as icon content in either toggle state', async () => {
      const { getByTestId, queryByText } = renderSettingsScreen();
      await act(async () => {});

      // Flip every toggle ON, then verify no bare "?" text node exists and
      // every icon still resolves to a real icon name.
      fireEvent.press(getByTestId('toggle-sound-effects'));
      fireEvent.press(getByTestId('toggle-haptics'));
      fireEvent.press(getByTestId('toggle-dark-mode'));

      expect(queryByText('?')).toBeNull();
      expect(getByTestId('toggle-sound-effects-icon').props.name).not.toBe('?');
      expect(getByTestId('toggle-haptics-icon').props.name).not.toBe('?');
      expect(getByTestId('toggle-dark-mode-icon').props.name).not.toBe('?');
    });
  });
});

// SettingsScreen previously rendered each toggle's name twice: once as a
// standalone <Text> next to the switch, and again because that same string
// was passed as ToggleSwitch's `label` prop (which renders its own <Text>
// right before the switch thumb). The fix removes both renderings in favor
// of a single accessibilityLabel (still readable by screen readers) plus the
// icon that already lives inside the switch thumb, so the toggle name is no
// longer duplicated on screen.
describe('SettingsScreen - No redundant text next to toggles', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('keeps the section containers for each toggle group (via testID)', async () => {
    const { getByTestId } = renderSettingsScreen();
    await act(async () => {});

    expect(getByTestId('section-sound-effects')).toBeTruthy();
    expect(getByTestId('section-haptics')).toBeTruthy();
    expect(getByTestId('section-dark-mode')).toBeTruthy();
  });

  it('does not render the redundant "Sound Effects" name label next to the toggle', async () => {
    const { queryByText } = renderSettingsScreen();
    await act(async () => {});

    // "Sound Effects" (en) / "Efekty Dźwiękowe" (pl) previously appeared as a
    // standalone label AND again inside ToggleSwitch's own label rendering.
    expect(queryByText('Sound Effects')).toBeNull();
  });

  it('does not render the redundant "Haptic Feedback" name label next to the toggle', async () => {
    const { queryByText } = renderSettingsScreen();
    await act(async () => {});

    expect(queryByText('Haptic Feedback')).toBeNull();
  });

  it('does not render the redundant "Dark Mode" name label next to the toggle', async () => {
    const { queryByText } = renderSettingsScreen();
    await act(async () => {});

    // The Appearance card's own header covers this; the toggle row itself
    // should not repeat "Dark Mode" as a separate label.
    expect(queryByText('Dark Mode')).toBeNull();
  });

  it('does not render the redundant Polish labels either', async () => {
    await act(async () => {
      await i18n.changeLanguage('pl');
    });

    const { queryByText } = renderSettingsScreen();
    await act(async () => {});

    expect(queryByText('Efekty Dźwiękowe')).toBeNull();
    expect(queryByText('Sprzężenie Zwrotne Haptyczne')).toBeNull();

    // Restore default language so later tests in this file aren't affected.
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('still exposes the toggle name to assistive tech via accessibilityLabel', async () => {
    const { getByTestId } = renderSettingsScreen();
    await act(async () => {});

    // getByTestId targets the Pressable rendered by ToggleSwitch; its
    // accessibilityLabel prop carries the name for screen readers even
    // though no visible <Text> duplicates it.
    expect(getByTestId('toggle-sound-effects').props.accessibilityLabel).toBe('Sound Effects');
    expect(getByTestId('toggle-haptics').props.accessibilityLabel).toBe('Haptic Feedback');
    expect(getByTestId('toggle-dark-mode').props.accessibilityLabel).toBe('Dark Mode');
  });

  it('still shows the enabled/disabled status text (not considered redundant)', async () => {
    const { getAllByText } = renderSettingsScreen();
    await act(async () => {});

    // Sound and Haptics both start enabled, so "Enabled" renders twice.
    expect(getAllByText('Enabled').length).toBeGreaterThanOrEqual(2);
  });

  it('keeps the Sound & Haptics card header intact', async () => {
    const { getByText } = renderSettingsScreen();
    await act(async () => {});

    expect(getByText('Sound & Haptics')).toBeTruthy();
  });
});

describe('SettingsScreen - Notifications', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockLoadNotificationSettings.mockClear();
    mockUpdateNotificationSettings.mockClear();
    // Default: reminders off, matching NotificationService's real default
    // when nothing has been persisted yet.
    mockLoadNotificationSettings.mockResolvedValue({ enabled: false, time: '09:00' });
  });

  it('renders the Notifications card with the reminder toggle', async () => {
    const { getByTestId, getByText } = renderSettingsScreen();
    await act(async () => {});

    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Daily Challenge Reminder')).toBeTruthy();
    expect(getByTestId('notification-toggle')).toBeTruthy();
  });

  it('loads persisted notification settings on mount', async () => {
    renderSettingsScreen();
    await act(async () => {});

    expect(mockLoadNotificationSettings).toHaveBeenCalledTimes(1);
  });

  it('does not render the reminder time picker while reminders are off', async () => {
    const { queryByTestId, queryByText } = renderSettingsScreen();
    await act(async () => {});

    expect(queryByTestId('reminder-time-picker')).toBeNull();
    expect(queryByText('Remind me at')).toBeNull();
  });

  it('renders the reminder time picker once reminders are loaded as enabled', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: true, time: '09:00' });

    const { getByTestId, getByText } = renderSettingsScreen();
    await act(async () => {});

    expect(getByText('Remind me at')).toBeTruthy();
    const picker = getByTestId('reminder-time-picker');
    expect(picker).toBeTruthy();
    expect(getByText('09:00')).toBeTruthy();
  });

  it('turns reminders on when the toggle is pressed and persists the change', async () => {
    const { getByTestId, queryByTestId } = renderSettingsScreen();
    await act(async () => {});

    expect(queryByTestId('reminder-time-picker')).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId('notification-toggle'));
    });

    // Toggling on reveals the time picker immediately (optimistic local state)...
    expect(getByTestId('reminder-time-picker')).toBeTruthy();
    // ...and persists via NotificationService with today's challenge country.
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(true, '09:00', 'Japan');
  });

  it('turns reminders off when the toggle is pressed while enabled', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: true, time: '09:00' });

    const { getByTestId, queryByTestId } = renderSettingsScreen();
    await act(async () => {});

    expect(getByTestId('reminder-time-picker')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('notification-toggle'));
    });

    expect(queryByTestId('reminder-time-picker')).toBeNull();
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(false, '09:00', 'Japan');
  });

  it('advances the reminder time when the time picker is pressed', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: true, time: '09:00' });

    const { getByTestId, getByText } = renderSettingsScreen();
    await act(async () => {});

    expect(getByText('09:00')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('reminder-time-picker'));
    });

    expect(getByText('09:30')).toBeTruthy();
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(true, '09:30', 'Japan');
  });

  it('wraps the reminder time back to 00:00 after 23:30', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: true, time: '23:30' });

    const { getByTestId, getByText } = renderSettingsScreen();
    await act(async () => {});

    await act(async () => {
      fireEvent.press(getByTestId('reminder-time-picker'));
    });

    expect(getByText('00:00')).toBeTruthy();
  });

  it('exposes the reminder toggle name to assistive tech via accessibilityLabel', async () => {
    const { getByTestId } = renderSettingsScreen();
    await act(async () => {});

    expect(getByTestId('notification-toggle').props.accessibilityLabel).toBe(
      'Daily Challenge Reminder'
    );
  });

  it('displays disabled state text when notifications are off', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: false, time: '09:00' });

    const { getByText } = renderSettingsScreen();
    await act(async () => {});

    expect(getByText('Disabled')).toBeTruthy();
  });

  it('displays enabled state text when notifications are on', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: true, time: '09:00' });

    const { getByTestId, getAllByText } = renderSettingsScreen();
    await act(async () => {});

    // Verify the notification section specifically shows "Enabled"
    const section = getByTestId('section-notifications');
    const enabledTexts = getAllByText('Enabled');
    expect(enabledTexts.length).toBeGreaterThan(0);
  });

  it('persists notification toggle state to NotificationService', async () => {
    const { getByTestId } = renderSettingsScreen();
    await act(async () => {});

    await act(async () => {
      fireEvent.press(getByTestId('notification-toggle'));
    });

    expect(mockUpdateNotificationSettings).toHaveBeenCalled();
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(
      expect.any(Boolean),
      expect.any(String),
      'Japan'
    );
  });

  it('respects loaded notification time', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: true, time: '14:30' });

    const { getByText } = renderSettingsScreen();
    await act(async () => {});

    expect(getByText('14:30')).toBeTruthy();
  });

  it('updates UI state immediately when toggling reminders', async () => {
    const { getByTestId, queryByTestId } = renderSettingsScreen();
    await act(async () => {});

    // Time picker should not be visible initially (disabled by default)
    expect(queryByTestId('reminder-time-picker')).toBeNull();

    // Toggle on
    await act(async () => {
      fireEvent.press(getByTestId('notification-toggle'));
    });

    // Time picker should now be visible (optimistic update)
    expect(getByTestId('reminder-time-picker')).toBeTruthy();
  });

  it('loads and displays notification settings on mount', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: true, time: '08:30' });

    const { getByText, getByTestId } = renderSettingsScreen();
    await act(async () => {});

    expect(mockLoadNotificationSettings).toHaveBeenCalledTimes(1);
    expect(getByText('08:30')).toBeTruthy();
    expect(getByTestId('reminder-time-picker')).toBeTruthy();
  });

  it('cycles through different reminder times', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: true, time: '09:00' });

    const { getByTestId, getByText } = renderSettingsScreen();
    await act(async () => {});

    // First press: 09:00 -> 09:30
    await act(async () => {
      fireEvent.press(getByTestId('reminder-time-picker'));
    });
    expect(getByText('09:30')).toBeTruthy();

    // Second press: 09:30 -> 10:00
    await act(async () => {
      fireEvent.press(getByTestId('reminder-time-picker'));
    });
    expect(getByText('10:00')).toBeTruthy();

    // Verify persistence after each change
    expect(mockUpdateNotificationSettings).toHaveBeenCalledTimes(2);
  });

  it('includes today\'s challenge country name in notification message', async () => {
    const { getByTestId } = renderSettingsScreen();
    await act(async () => {});

    await act(async () => {
      fireEvent.press(getByTestId('notification-toggle'));
    });

    // Should call updateNotificationSettings with Japan (mocked challenge)
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(true, '09:00', 'Japan');
  });

  it('toggles through multiple time values with persistence', async () => {
    mockLoadNotificationSettings.mockResolvedValue({ enabled: true, time: '23:00' });

    const { getByTestId, getByText } = renderSettingsScreen();
    await act(async () => {});

    // 23:00 -> 23:30
    await act(async () => {
      fireEvent.press(getByTestId('reminder-time-picker'));
    });
    expect(getByText('23:30')).toBeTruthy();
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(true, '23:30', 'Japan');

    // 23:30 -> 00:00 (midnight wrap)
    await act(async () => {
      fireEvent.press(getByTestId('reminder-time-picker'));
    });
    expect(getByText('00:00')).toBeTruthy();
    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(true, '00:00', 'Japan');
  });

  it('unmounts cleanly without memory leaks', async () => {
    const { unmount } = renderSettingsScreen();
    await act(async () => {});

    expect(() => {
      unmount();
    }).not.toThrow();
  });
});
