import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { Country, getLocalizedCountryName } from '../../../utils/countries';
import {
  formatPopulation,
  formatNumber,
  formatLanguages,
} from '../../../utils/formatters';
import { commonTokens } from '../../../theme/tokens';

interface ComparisonTableProps {
  countries: Country[];
}

interface StatRow {
  labelKey: string;
  values: string[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ countries }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { colors } = theme;

  const stats: StatRow[] = [
    {
      labelKey: 'capital',
      values: countries.map((c) => c.capital || t('noData')),
    },
    {
      labelKey: 'population',
      values: countries.map((c) => formatPopulation(c.population) ?? t('noData')),
    },
    {
      labelKey: 'area',
      values: countries.map((c) =>
        c.area ? formatNumber(c.area) ?? t('noData') : t('noData')
      ),
    },
    {
      labelKey: 'region',
      values: countries.map((c) => c.region || t('noData')),
    },
    {
      labelKey: 'languages',
      values: countries.map((c) => formatLanguages(c.languages) ?? t('noData')),
    },
  ];

  const colWidth = 100 / (countries.length + 1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} testID="comparison-table">
      <View
        style={[
          localStyles.table,
          { borderColor: colors.cardBorder, backgroundColor: colors.card },
        ]}
      >
        {/* Header row */}
        <View style={[localStyles.row, { borderBottomColor: colors.cardBorder }]}>
          <View style={[localStyles.cell, { width: `${colWidth}%` }]}>
            <Text style={[localStyles.headerText, { color: colors.text }]}>
              {t('comparisonStat')}
            </Text>
          </View>
          {countries.map((country) => (
            <View key={country.code} style={[localStyles.cell, { width: `${colWidth}%` }]}>
              <Text style={[localStyles.headerText, { color: colors.text }]}>
                {getLocalizedCountryName(country, i18n.language)}
              </Text>
            </View>
          ))}
        </View>

        {/* Data rows */}
        {stats.map((stat, idx) => (
          <View
            key={stat.labelKey}
            style={[
              localStyles.row,
              {
                borderBottomColor: colors.cardBorder,
                backgroundColor: idx % 2 === 0 ? colors.surfaceSubtle : 'transparent',
              },
            ]}
          >
            <View style={[localStyles.cell, { width: `${colWidth}%` }]}>
              <Text style={[localStyles.cellText, { color: colors.textSecondary }]}>
                {t(stat.labelKey)}
              </Text>
            </View>
            {stat.values.map((value, valueIdx) => (
              <View key={valueIdx} style={[localStyles.cell, { width: `${colWidth}%` }]}>
                <Text style={[localStyles.cellText, { color: colors.text }]}>{value}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderRadius: commonTokens.borderRadius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  cell: {
    padding: commonTokens.spacing.md,
    justifyContent: 'center',
    minWidth: 96,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  cellText: {
    fontSize: 12,
  },
});
