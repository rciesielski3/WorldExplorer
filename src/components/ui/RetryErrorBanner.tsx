import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

interface RetryErrorBannerProps {
  visible: boolean;
  error?: Error | string;
  onRetry: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
  isRetrying?: boolean;
  showDismiss?: boolean;
}

export const RetryErrorBanner: React.FC<RetryErrorBannerProps> = ({
  visible,
  error,
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
  showDismiss = true,
}) => {
  const { theme } = useTheme();
  const [animationValue] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, animationValue]);

  if (!visible) {
    return null;
  }

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred. Please try again.';
  const heightInterpolation = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const opacityInterpolation = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: heightInterpolation,
          opacity: opacityInterpolation,
          backgroundColor: theme.colors.error || '#EF4444',
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconAndText}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={20}
            color="white"
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={[styles.errorText, { color: 'white' }]}>
              {errorMessage}
            </Text>
            {retryCount > 0 && maxRetries > 0 && (
              <Text style={[styles.retryInfo, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                Attempt {retryCount} of {maxRetries}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {!isRetrying && (
            <TouchableOpacity
              onPress={onRetry}
              style={[styles.button, styles.retryButton]}
              disabled={isRetrying}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={16}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: 'white' }]}>
                Retry
              </Text>
            </TouchableOpacity>
          )}

          {showDismiss && onDismiss && !isRetrying && (
            <TouchableOpacity
              onPress={onDismiss}
              style={[styles.button, styles.dismissButton]}
            >
              <MaterialCommunityIcons
                name="close"
                size={16}
                color={theme.colors.text || '#ffffff'}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: theme.colors.text || '#ffffff' }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
          )}

          {isRetrying && (
            <View style={styles.retryingIndicator}>
              <Text style={[styles.retryingText, { color: 'white' }]}>
                Retrying...
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAndText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  retryInfo: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  retryingIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
  },
  retryingText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
