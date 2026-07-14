import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeNotifications,
  scheduleNotification,
  cancelNotifications,
  loadNotificationSettings,
  saveNotificationSettings,
} from '../NotificationService';

// NOTE: A bare `jest.mock('expo-notifications')` (Jest automock) requires
// loading the real module first to introspect its shape. expo-notifications
// pulls in expo-modules-core's native module bridge as a side effect of that
// require, which throws under Jest (no native runtime present). An explicit
// factory avoids touching the real module at all, mirroring the
// expo-haptics mock in jest.setup.js.
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: 'timeInterval',
  },
}));
jest.mock('@react-native-async-storage/async-storage');

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadNotificationSettings', () => {
    it('loads notification settings from AsyncStorage', async () => {
      const settings = {
        enabled: true,
        time: '09:00',
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(settings));

      const result = await loadNotificationSettings();

      expect(result).toEqual(settings);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('worldexplorer_notifications_enabled');
    });

    it('returns default settings if not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await loadNotificationSettings();

      expect(result.enabled).toBe(false);
      expect(result.time).toBe('09:00');
    });
  });

  describe('saveNotificationSettings', () => {
    it('saves settings to AsyncStorage', async () => {
      const settings = { enabled: true, time: '10:00' };
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await saveNotificationSettings(settings);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'worldexplorer_notifications_enabled',
        JSON.stringify(settings)
      );
    });
  });

  describe('scheduleNotification', () => {
    it('schedules notification for specified time', async () => {
      const mockNotificationId = 'test-id';
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);

      await scheduleNotification('09:00', 'Test message');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('handles scheduling errors gracefully', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Scheduling failed')
      );

      // Should not throw
      await expect(scheduleNotification('09:00', 'Test')).resolves.not.toThrow();
    });
  });

  describe('cancelNotifications', () => {
    it('cancels all scheduled notifications', async () => {
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
        undefined
      );

      await cancelNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });
});
