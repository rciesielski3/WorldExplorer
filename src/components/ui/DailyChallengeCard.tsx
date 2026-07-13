import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { Country, getLocalizedCountryName } from '../../../utils/countries';
import { commonTokens } from '../../../theme/tokens';

interface DailyChallengeCardProps {
  country: Country;
  onPress: () => void;
  testID?: string;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  country,
  onPress,
  testID,
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { colors } = theme;

  // Reuses the same localized-name fallback logic as the rest of the app
  // (see utils/countries.ts) instead of reimplementing it here.
  const countryName = getLocalizedCountryName(country, i18n.language);

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.flag}>{country.flag}</Text>
        <Text style={[styles.countryName, { color: colors.text }]}>{countryName}</Text>
      </View>

      <Text style={[styles.label, { color: colors.textTertiary }]}>
        {t('dailyChallenge')}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onPress}
        activeOpacity={0.8}
        testID={`${testID || 'daily-card'}-button`}
      >
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>
          {t('learnAndQuiz')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: commonTokens.spacing.md,
    marginVertical: commonTokens.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: commonTokens.spacing.md,
  },
  flag: {
    fontSize: 32,
    marginRight: commonTokens.spacing.sm,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    marginBottom: commonTokens.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    paddingVertical: commonTokens.spacing.md,
    paddingHorizontal: commonTokens.spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
