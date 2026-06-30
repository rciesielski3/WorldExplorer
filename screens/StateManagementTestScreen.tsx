/**
 * StateManagementTestScreen
 *
 * Temporary test screen to verify:
 * - ErrorCard component renders and responds to retry/dismiss
 * - EmptyStateCard component renders correctly
 * - useReducer pattern works with error classification
 * - Design tokens are applied correctly
 * - No console errors
 *
 * This screen demonstrates the state management pattern and can be
 * navigated to for manual testing. Remove or hide in production.
 */

import React, { useReducer, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { ThemeContext } from '../context/ThemeContext';
import ErrorCard from '../src/components/ui/ErrorCard';
import EmptyStateCard from '../src/components/ui/EmptyStateCard';
import type { ApiError } from '../types/errors';
import { createApiError, ERRORS } from '../types/errors';
import { spacing, radius, typography, darkTheme, lightTheme, type ThemeColors } from '../theme/tokens';

interface TestState {
  displayedError: ApiError | null;
  emptyStateShown: boolean;
  testLog: string[];
}

type TestAction =
  | { type: 'SHOW_NETWORK_ERROR' }
  | { type: 'SHOW_NOT_FOUND_ERROR' }
  | { type: 'SHOW_SERVER_ERROR' }
  | { type: 'SHOW_INVALID_DATA_ERROR' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_LOG' }
  | { type: 'TOGGLE_EMPTY_STATE' }
  | { type: 'ADD_LOG'; payload: string };

const initialState: TestState = {
  displayedError: null,
  emptyStateShown: false,
  testLog: ['Test screen initialized'],
};

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'SHOW_NETWORK_ERROR': {
      const error = createApiError('NETWORK', 'Cannot connect to API');
      return {
        ...state,
        displayedError: error,
        testLog: [...state.testLog, '✓ Network error shown'],
      };
    }
    case 'SHOW_NOT_FOUND_ERROR': {
      const error = createApiError('NOT_FOUND', 'Data not found', undefined, 404);
      return {
        ...state,
        displayedError: error,
        testLog: [...state.testLog, '✓ Not found error shown'],
      };
    }
    case 'SHOW_SERVER_ERROR': {
      const error = createApiError(
        'SERVER_ERROR',
        'Server returned an error',
        undefined,
        500
      );
      return {
        ...state,
        displayedError: error,
        testLog: [...state.testLog, '✓ Server error shown'],
      };
    }
    case 'SHOW_INVALID_DATA_ERROR': {
      const error = createApiError('INVALID_DATA', 'Invalid data format');
      return {
        ...state,
        displayedError: error,
        testLog: [...state.testLog, '✓ Invalid data error shown'],
      };
    }
    case 'CLEAR_ERROR':
      return {
        ...state,
        displayedError: null,
        testLog: [...state.testLog, '✓ Error cleared'],
      };
    case 'CLEAR_LOG':
      return {
        ...state,
        testLog: ['Test log cleared'],
      };
    case 'TOGGLE_EMPTY_STATE':
      return {
        ...state,
        emptyStateShown: !state.emptyStateShown,
        testLog: [
          ...state.testLog,
          `✓ Empty state ${!state.emptyStateShown ? 'shown' : 'hidden'}`,
        ],
      };
    case 'ADD_LOG':
      return {
        ...state,
        testLog: [...state.testLog, action.payload],
      };
    default:
      return state;
  }
}

const StateManagementTestScreen: React.FC = () => {
  const [state, dispatch] = useReducer(testReducer, initialState);
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('StateManagementTestScreen must be used within ThemeProvider');
  }
  const { theme } = themeContext;
  const colors = theme.isDarkMode ? darkTheme.colors : lightTheme.colors;

  useEffect(() => {
    console.log('StateManagementTestScreen mounted - testing error handling patterns');
  }, []);

  const handleRetry = async () => {
    dispatch({ type: 'ADD_LOG', payload: '⟳ Retry button pressed (simulating API retry)' });
    // Simulate retry delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch({ type: 'ADD_LOG', payload: '✓ Retry completed' });
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const handleDismiss = () => {
    dispatch({ type: 'ADD_LOG', payload: '✕ Error dismissed' });
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const handleEmptyStateAction = () => {
    dispatch({ type: 'ADD_LOG', payload: '⟳ Empty state action triggered' });
    dispatch({ type: 'TOGGLE_EMPTY_STATE' });
  };

  const styles = theme.isDarkMode ? _darkStyles : _lightStyles;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={styles.title}>State Management & Error Handling Test</Text>
        <Text style={styles.subtitle}>
          Test the error handling patterns, UI components, and design token integration
        </Text>
      </View>

      {/* Error Display Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Error Card Component</Text>
        <Text style={styles.sectionDescription}>
          Click buttons below to test different error types. Retry and dismiss buttons trigger
          haptic feedback.
        </Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.testButton, { borderColor: colors.error }]}
            onPress={() => dispatch({ type: 'SHOW_NETWORK_ERROR' })}
          >
            <MaterialCommunityIcons name="wifi-off" size={20} color={colors.error} />
            <Text style={styles.testButtonText}>Network Error</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { borderColor: colors.error }]}
            onPress={() => dispatch({ type: 'SHOW_NOT_FOUND_ERROR' })}
          >
            <MaterialCommunityIcons name="file-not-found" size={20} color={colors.error} />
            <Text style={styles.testButtonText}>Not Found (404)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { borderColor: colors.error }]}
            onPress={() => dispatch({ type: 'SHOW_SERVER_ERROR' })}
          >
            <MaterialCommunityIcons name="server-network-off" size={20} color={colors.error} />
            <Text style={styles.testButtonText}>Server Error (500)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { borderColor: colors.error }]}
            onPress={() => dispatch({ type: 'SHOW_INVALID_DATA_ERROR' })}
          >
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.testButtonText}>Invalid Data</Text>
          </TouchableOpacity>
        </View>

        {state.displayedError && (
          <View style={styles.componentPreview}>
            <ErrorCard
              error={state.displayedError}
              onRetry={handleRetry}
              onDismiss={handleDismiss}
              showRetryButton={state.displayedError.retryable}
              showDismissButton={true}
              testID="error-card-test"
            />
          </View>
        )}

        {!state.displayedError && (
          <View style={styles.emptyPreview}>
            <Text style={styles.previewPlaceholder}>
              Click an error type button above to show ErrorCard
            </Text>
          </View>
        )}
      </View>

      {/* Empty State Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Empty State Card Component</Text>
        <Text style={styles.sectionDescription}>
          Toggle below to show/hide the empty state component.
        </Text>

        <TouchableOpacity
          style={[styles.testButton, { borderColor: colors.primary }]}
          onPress={() => dispatch({ type: 'TOGGLE_EMPTY_STATE' })}
        >
          <MaterialCommunityIcons name="inbox-outline" size={20} color={colors.primary} />
          <Text style={styles.testButtonText}>
            {state.emptyStateShown ? 'Hide' : 'Show'} Empty State
          </Text>
        </TouchableOpacity>

        {state.emptyStateShown && (
          <View style={styles.componentPreview}>
            <EmptyStateCard
              icon="map-search-outline"
              title="No Countries Found"
              subtitle="Try adjusting your search filters or regions"
              actionLabel="Clear Filters"
              onAction={handleEmptyStateAction}
              testID="empty-state-card-test"
            />
          </View>
        )}

        {!state.emptyStateShown && (
          <View style={styles.emptyPreview}>
            <Text style={styles.previewPlaceholder}>
              Click the button above to show EmptyStateCard
            </Text>
          </View>
        )}
      </View>

      {/* Design Tokens Reference */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Design Tokens Applied</Text>
        <View style={styles.tokensList}>
          <Text style={styles.tokenItem}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} /> Spacing: xs(4), sm(8), md(12), lg(16), xl(24), xxl(32)
          </Text>
          <Text style={styles.tokenItem}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} /> Radius: sm(6), md(8), lg(12), xl(16), full(999)
          </Text>
          <Text style={styles.tokenItem}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} /> Typography: displayLg, bodyMd, titleMd, label
          </Text>
          <Text style={styles.tokenItem}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} /> Theme: Dark/Light modes with semantic colors
          </Text>
          <Text style={styles.tokenItem}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} /> Error colors: {colors.error} bg + borders
          </Text>
        </View>
      </View>

      {/* Test Log */}
      <View style={styles.section}>
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Test Log</Text>
          <TouchableOpacity
            onPress={() => dispatch({ type: 'CLEAR_LOG' })}
            style={styles.clearLogButton}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.logContainer}>
          {state.testLog.map((log, index) => (
            <Text key={index} style={styles.logEntry}>
              {log}
            </Text>
          ))}
        </View>
      </View>

      {/* Instructions */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Test Checklist</Text>
        <Text style={styles.instruction}>
          ✓ ErrorCard displays with correct icon based on error type
        </Text>
        <Text style={styles.instruction}>
          ✓ Retry button appears only for retryable errors
          </Text>
        <Text style={styles.instruction}>
          ✓ Retry and dismiss buttons trigger haptic feedback
        </Text>
        <Text style={styles.instruction}>
          ✓ EmptyStateCard renders with custom icon and action
        </Text>
        <Text style={styles.instruction}>
          ✓ All components use theme colors (dark/light mode)
        </Text>
        <Text style={styles.instruction}>
          ✓ No console errors during interaction
        </Text>
        <Text style={styles.instruction}>
          ✓ useReducer pattern manages state correctly
        </Text>
        <Text style={styles.instruction}>
          ✓ Design tokens applied consistently
        </Text>
      </View>
    </ScrollView>
  );
};

function createStyles(colors: ThemeColors, isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    header: {
      marginBottom: spacing.xxl,
    },
    title: {
      ...typography.displayMd,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.bodyMd,
      color: colors.textSecondary,
    },
    section: {
      marginBottom: spacing.xxl,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    },
    lastSection: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.titleLg,
      color: colors.text,
      marginBottom: spacing.md,
    },
    sectionDescription: {
      ...typography.bodyMd,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    buttonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    testButton: {
      flex: 1,
      minWidth: '45%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      gap: spacing.sm,
    },
    testButtonText: {
      ...typography.titleMd,
      color: colors.text,
      fontWeight: '600',
    },
    componentPreview: {
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    },
    emptyPreview: {
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      alignItems: 'center',
    },
    previewPlaceholder: {
      ...typography.bodyMd,
      color: colors.textTertiary,
      textAlign: 'center',
    },
    tokensList: {
      gap: spacing.sm,
    },
    tokenItem: {
      ...typography.bodyMd,
      color: colors.textSecondary,
      alignItems: 'center',
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    clearLogButton: {
      padding: spacing.sm,
    },
    logContainer: {
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
      borderRadius: radius.md,
      padding: spacing.md,
      maxHeight: 200,
    },
    logEntry: {
      ...typography.bodySm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      fontFamily: 'monospace',
    },
    instruction: {
      ...typography.bodyMd,
      color: colors.text,
      marginBottom: spacing.md,
      paddingLeft: spacing.md,
    },
  });
}

// Pre-compute style sheets once per theme to avoid StyleSheet.create on every render
const _darkStyles = createStyles(darkTheme.colors, true);
const _lightStyles = createStyles(lightTheme.colors, false);

export default StateManagementTestScreen;
