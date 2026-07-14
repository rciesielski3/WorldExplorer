import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../utils/logger';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:MM format
}

const SETTINGS_KEY = 'worldexplorer_notifications_enabled';
const NOTIFICATION_ID_KEY = 'worldexplorer_notification_id';

/**
 * Configure notification handler behavior
 */
export async function initializeNotifications(): Promise<void> {
  try {
    // Set notification handler to show notifications even when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    logger.info('Notifications initialized', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('Failed to initialize notifications', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Load notification settings from AsyncStorage
 */
export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored) as NotificationSettings;
    }
  } catch (error) {
    logger.warn('Failed to load notification settings', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  // Return defaults if not found or error
  return {
    enabled: false,
    time: '09:00',
  };
}

/**
 * Save notification settings to AsyncStorage
 */
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    logger.warn('Failed to save notification settings', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Schedule a daily notification at the specified time (HH:MM format)
 */
export async function scheduleNotification(time: string, message: string): Promise<void> {
  try {
    // Parse time (HH:MM)
    const [hours, minutes] = time.split(':').map(Number);

    // Calculate seconds until next occurrence of this time
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const secondsUntilNotification = Math.floor(
      (scheduledTime.getTime() - now.getTime()) / 1000
    );

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌍 World Explorer',
        body: message,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilNotification,
        repeats: true, // Repeat daily
      },
    });

    // Store notification ID for later cancellation
    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);

    logger.info('Notification scheduled', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: { time, notificationId },
    });
  } catch (error) {
    logger.warn('Failed to schedule notification', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);

    logger.info('Notifications cancelled', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('Failed to cancel notifications', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Update notification settings and reschedule if needed
 */
export async function updateNotificationSettings(
  enabled: boolean,
  time: string,
  countryName?: string
): Promise<void> {
  // Save settings
  const settings: NotificationSettings = { enabled, time };
  await saveNotificationSettings(settings);

  // Cancel existing notifications
  await cancelNotifications();

  // Schedule new notification if enabled
  if (enabled && countryName) {
    const message = `🌍 Today's country: ${countryName} — Ready to learn?`;
    await scheduleNotification(time, message);
  }
}
