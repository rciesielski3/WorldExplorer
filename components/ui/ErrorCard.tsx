import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

import { ThemeContext } from '../../context/ThemeContext';
import type { ApiError } from '../../types/errors';
import { spacing, radius, typography, darkTheme, lightTheme, type ThemeColors } from '../../theme/tokens';

interface ErrorCardProps {
  error: ApiError;
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  showRetryButton?: boolean;
  showDismissButton?: boolean;
  testID?: string;
}

/**
 * ErrorCard - Displays API errors with optional retry and dismiss buttons
 *
 * Features:
 * - Shows error message and icon
 * - Retryable errors show retry button with haptic feedback
 * - Optional dismiss button
 * - Theme-aware styling using design tokens
 * - Accessible with proper labels
 *
 * Usage:
 * ```tsx
 * {error && (
 *   <ErrorCard
 *     error={error}
 *     onRetry={handleRetry}
 *     showRetryButton={error.retryable}
 *   />
 * )}
 * ```
 */
const ErrorCard: React.FC<ErrorCardProps> = ({
  error,
  onRetry,
  onDismiss,
  showRetryButton = true,
  showDismissButton = false,
  testID = 'error-card',
}) => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('ErrorCard must be used within ThemeProvider');
  }
  const { theme } = themeContext;
  const colors = theme.isDarkMode ? darkTheme.colors : lightTheme.colors;
  const isRetryable = error.retryable && showRetryButton;

  const handleRetryPress = async () => {
    // Haptic feedback on retry
    await Haptics.selectionAsync();

    if (onRetry) {
      await onRetry();
    }
  };

  const handleDismissPress = async () => {
    // Haptic feedback on dismiss
    await Haptics.selectionAsync();

    if (onDismiss) {
      onDismiss();
    }
  };

  const styles = theme.isDarkMode ? _darkStyles : _lightStyles;
  const errorIcon = getErrorIcon(error.type);

  return (
    <View
      style={styles.container}
      testID={testID}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${error.message}`}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={errorIcon}
            size={24}
            color={colors.error}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={styles.errorMessage}
            numberOfLines={3}
            accessibilityLabel="Error message"
          >
            {error.message}
          </Text>
          {error.statusCode && (
            <Text style={styles.statusCode}>
              Code: {error.statusCode}
            </Text>
          )}
        </View>
      </View>

      {(isRetryable || showDismissButton) && (
        <View style={styles.actionRow}>
          {isRetryable && (
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={handleRetryPress}
              activeOpacity={0.75}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Retry"
            >
              <MaterialCommunityIcons
                name="reload"
                size={16}
                color={colors.error}
                style={styles.buttonIcon}
              />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}

          {showDismissButton && (
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={handleDismissPress}
              activeOpacity={0.75}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
            >
              <MaterialCommunityIcons
                name="close"
                size={16}
                color={colors.textSecondary}
                style={styles.buttonIcon}
              />
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

function getErrorIcon(
  errorType: 'NETWORK' | 'NOT_FOUND' | 'INVALID_DATA' | 'UNAUTHORIZED' | 'SERVER_ERROR' | 'UNKNOWN'
): string {
  switch (errorType) {
    case 'NETWORK':
      return 'wifi-off';
    case 'NOT_FOUND':
      return 'file-not-found';
    case 'INVALID_DATA':
      return 'alert-circle-outline';
    case 'UNAUTHORIZED':
      return 'lock-outline';
    case 'SERVER_ERROR':
      return 'server-network-off';
    default:
      return 'alert-outline';
  }
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.errorBg,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    content: {
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: colors.errorIconBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
      flexShrink: 0,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    errorMessage: {
      ...typography.bodyMd,
      color: colors.text,
      lineHeight: 19,
      marginBottom: spacing.xs,
    },
    statusCode: {
      ...typography.bodySm,
      color: colors.textSecondary,
    },
    actionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.errorBorder,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
    },
    retryButton: {
      backgroundColor: colors.errorBg,
      borderWidth: 1,
      borderColor: colors.errorBorder,
    },
    dismissButton: {
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonIcon: {
      marginRight: spacing.xs,
    },
    retryButtonText: {
      ...typography.titleMd,
      color: colors.error,
      fontWeight: '600',
    },
    dismissButtonText: {
      ...typography.titleMd,
      color: colors.textSecondary,
      fontWeight: '600',
    },
  });
}

// Pre-compute style sheets once per theme to avoid StyleSheet.create on every render
const _darkStyles = createStyles(darkTheme.colors);
const _lightStyles = createStyles(lightTheme.colors);

export default ErrorCard;
