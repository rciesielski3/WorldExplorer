/**
 * Haptics utility for consistent haptic feedback
 * Provides convenience wrappers around expo-haptics
 */

import * as Haptics from "expo-haptics";

/**
 * Light haptic feedback (for small interactions like toggles, selections)
 */
export const triggerLightHaptic = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Haptics not available on all devices, fail silently
  }
};

/**
 * Medium haptic feedback (for main actions like navigation, submit)
 */
export const triggerMediumHaptic = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Haptics not available on all devices, fail silently
  }
};

/**
 * Success haptic feedback (for positive confirmations)
 */
export const triggerSuccessHaptic = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Haptics not available on all devices, fail silently
  }
};

/**
 * Warning haptic feedback (for alerts or errors)
 */
export const triggerWarningHaptic = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    // Haptics not available on all devices, fail silently
  }
};

/**
 * Error haptic feedback (for critical errors)
 */
export const triggerErrorHaptic = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    // Haptics not available on all devices, fail silently
  }
};
