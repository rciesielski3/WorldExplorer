import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

import { ThemeContext } from '../../context/ThemeContext';
import { spacing, radius, typography, darkTheme, lightTheme, type ThemeColors } from '../../theme/tokens';

interface EmptyStateCardProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  showAction?: boolean;
  testID?: string;
}

/**
 * EmptyStateCard - Displays empty state message when no data is available
 *
 * Features:
 * - Customizable icon, title, and subtitle
 * - Optional action button
 * - Theme-aware styling
 * - Clean, user-friendly presentation
 *
 * Usage:
 * ```tsx
 * {filteredCountries.length === 0 && (
 *   <EmptyStateCard
 *     icon="map-search-outline"
 *     title="No Countries Found"
 *     subtitle="Try adjusting your search or filter"
 *     actionLabel="Clear Filters"
 *     onAction={() => handleClearFilters()}
 *   />
 * )}
 * ```
 */
const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon = 'inbox-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
  showAction = true,
  testID = 'empty-state-card',
}) => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('EmptyStateCard must be used within ThemeProvider');
  }
  const { theme } = themeContext;
  const colors = theme.isDarkMode ? darkTheme.colors : lightTheme.colors;

  const handleActionPress = async () => {
    await Haptics.selectionAsync();

    if (onAction) {
      await onAction();
    }
  };

  const styles = theme.isDarkMode ? _darkStyles : _lightStyles;
  const shouldShowAction = actionLabel && onAction && showAction;

  return (
    <View
      style={styles.container}
      testID={testID}
      accessible
      accessibilityRole="none"
      accessibilityLabel={`Empty state: ${title}`}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={48}
          color={colors.textTertiary}
        />
      </View>

      <Text
        style={styles.title}
        accessibilityRole="header"
        accessibilityLabel={title}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          style={styles.subtitle}
          accessibilityLabel={subtitle}
        >
          {subtitle}
        </Text>
      )}

      {shouldShowAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleActionPress}
          activeOpacity={0.75}
          accessible
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={16}
            color={colors.primary}
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      marginBottom: spacing.lg,
      opacity: 0.6,
    },
    title: {
      ...typography.displaySm,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.bodyMd,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
      maxWidth: 300,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    actionIcon: {
      marginRight: spacing.xs,
    },
    actionButtonText: {
      ...typography.titleMd,
      color: colors.primary,
      fontWeight: '600',
    },
  });
}

// Pre-compute style sheets once per theme to avoid StyleSheet.create on every render
const _darkStyles = createStyles(darkTheme.colors);
const _lightStyles = createStyles(lightTheme.colors);

export default EmptyStateCard;
