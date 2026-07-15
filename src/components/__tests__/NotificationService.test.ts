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
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await cancelNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('worldexplorer_notification_id');
    });

    it('handles cancellation errors gracefully', async () => {
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockRejectedValue(
        new Error('Cancel failed')
      );

      // Should not throw
      await expect(cancelNotifications()).resolves.not.toThrow();
    });
  });

  describe('initializeNotifications', () => {
    it('sets notification handler', async () => {
      await initializeNotifications();

      expect(Notifications.setNotificationHandler).toHaveBeenCalled();
      const call = (Notifications.setNotificationHandler as jest.Mock).mock.calls[0];
      expect(call[0]).toBeDefined();
    });

    it('handles initialization errors gracefully', async () => {
      (Notifications.setNotificationHandler as jest.Mock).mockImplementation(() => {
        throw new Error('Handler failed');
      });

      // Should not throw
      await expect(initializeNotifications()).resolves.not.toThrow();
    });
  });

  describe('scheduleNotification - Edge Cases', () => {
    it('schedules for tomorrow if time has already passed today', async () => {
      const mockNotificationId = 'test-id-2';
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);

      // Mock a time in the past (e.g., 01:00 AM)
      const pastTime = '01:00';
      await scheduleNotification(pastTime, 'Morning challenge');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
      expect(call[0].trigger.seconds).toBeGreaterThan(0);
    });

    it('stores notification ID in AsyncStorage', async () => {
      const mockNotificationId = 'stored-id-123';
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await scheduleNotification('14:00', 'Afternoon challenge');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'worldexplorer_notification_id',
        mockNotificationId
      );
    });

    it('includes country name in notification message', async () => {
      const mockNotificationId = 'test-id-3';
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);

      const testMessage = '🌍 Today\'s country: Brazil — Ready to learn?';
      await scheduleNotification('09:00', testMessage);

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
      expect(call[0].content.body).toBe(testMessage);
    });

    it('sets notification title to World Explorer', async () => {
      const mockNotificationId = 'test-id-4';
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);

      await scheduleNotification('09:00', 'Test message');

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
      expect(call[0].content.title).toBe('🌍 World Explorer');
    });

    it('configures daily repeat', async () => {
      const mockNotificationId = 'test-id-5';
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);

      await scheduleNotification('09:00', 'Daily challenge');

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
      expect(call[0].trigger.repeats).toBe(true);
    });
  });

  describe('saveNotificationSettings - Error Handling', () => {
    it('logs but does not throw on save error', async () => {
      const settings = { enabled: true, time: '10:00' };
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save failed'));

      // Should not throw
      await expect(saveNotificationSettings(settings)).resolves.not.toThrow();
    });
  });

  describe('loadNotificationSettings - Error Handling', () => {
    it('returns defaults on parse error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{ invalid json');

      const result = await loadNotificationSettings();

      expect(result.enabled).toBe(false);
      expect(result.time).toBe('09:00');
    });

    it('returns defaults on storage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await loadNotificationSettings();

      expect(result.enabled).toBe(false);
      expect(result.time).toBe('09:00');
    });
  });
});
