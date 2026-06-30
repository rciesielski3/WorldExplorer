import React from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ViewStyle,
  ListRenderItem,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

import { useTheme } from '../../context/ThemeContext';
import { commonTokens } from '../../theme/tokens';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Country,
  fetchCountries,
  getLocalizedCountryName,
  getSearchableCountryText,
} from '../../utils/countries';
import { FLAG_ASSETS } from '../../utils/flagAssets';

// ─── Types ─────────────────────────────────────────────────────────────────

type ExploreScreenProps = {
  navigation: any;
};

type RegionFilter = {
  key: string;
  labelKey: string;
  value: string | null;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const REGION_FILTERS: RegionFilter[] = [
  { key: 'all', labelKey: 'allCountries', value: null },
  { key: 'africa', labelKey: 'regionAfrica', value: 'Africa' },
  { key: 'asia', labelKey: 'regionAsia', value: 'Asia' },
  { key: 'europe', labelKey: 'regionEurope', value: 'Europe' },
  { key: 'americas', labelKey: 'regionAmericas', value: 'Americas' },
  { key: 'oceania', labelKey: 'regionOceania', value: 'Oceania' },
];

const GRID_COLUMNS = 2;

// ─── Utility Functions ─────────────────────────────────────────────────────

const formatPopulation = (population: number | undefined): string | null => {
  if (!Number.isFinite(population)) {
    return null;
  }

  if ((population as number) >= 1_000_000) {
    return `${Math.round((population as number) / 1_000_000)}M`;
  }

  if ((population as number) >= 1_000) {
    return `${Math.round((population as number) / 1_000)}K`;
  }

  return (population as number).toLocaleString();
};

// ─── Components ────────────────────────────────────────────────────────────

interface RegionChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const RegionChip = React.memo(({ label, isActive, onPress }: RegionChipProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: commonTokens.spacing.md,
        paddingVertical: commonTokens.spacing.sm,
        borderRadius: commonTokens.borderRadius.full,
        backgroundColor: isActive
          ? theme.colors.secondary
          : 'rgba(255, 255, 255, 0.2)',
        borderWidth: isActive ? 0 : 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: commonTokens.spacing.xs,
      }}
    >
      <Text
        style={{
          color: isActive ? '#FFFFFF' : theme.colors.text,
          fontSize: commonTokens.typography.bodyMd.fontSize,
          fontFamily: commonTokens.typography.titleMd.fontFamily,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

RegionChip.displayName = 'RegionChip';

interface CountryGridItemProps {
  country: Country;
  onPress: (country: Country) => void;
  itemWidth: number;
  language: string;
}

const CountryGridItem = React.memo(
  ({ country, onPress, itemWidth, language }: CountryGridItemProps) => {
    const { theme } = useTheme();

    const metadata = [
      country.capital,
      country.region,
      formatPopulation(country.population),
    ].filter(Boolean);

    return (
      <Animated.View
        entering={FadeIn}
        style={{
          width: itemWidth,
          paddingHorizontal: commonTokens.spacing.sm,
          marginBottom: commonTokens.spacing.md,
        }}
      >
        <Card
          onPress={() => onPress(country)}
          style={{
            overflow: 'hidden',
          }}
        >
          <View>
            {/* Flag Image */}
            <Image
              source={FLAG_ASSETS[country.flagPath]}
              style={{
                width: '100%',
                height: 120,
                borderRadius: commonTokens.borderRadius.md,
                marginBottom: commonTokens.spacing.md,
              }}
              resizeMode="cover"
            />

            {/* Country Name */}
            <Text
              style={{
                fontSize: commonTokens.typography.titleLg.fontSize,
                fontFamily: commonTokens.typography.titleLg.fontFamily,
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: commonTokens.spacing.xs,
              }}
              numberOfLines={1}
            >
              {getLocalizedCountryName(country, language)}
            </Text>

            {/* Metadata */}
            <Text
              style={{
                fontSize: commonTokens.typography.bodySm.fontSize,
                fontFamily: commonTokens.typography.bodySm.fontFamily,
                color: theme.colors.textSecondary,
                marginBottom: commonTokens.spacing.md,
              }}
              numberOfLines={2}
            >
              {metadata.join(' · ')}
            </Text>

            {/* Region Badge */}
            <Badge label={country.region} variant="secondary" />
          </View>
        </Card>
      </Animated.View>
    );
  }
);

CountryGridItem.displayName = 'CountryGridItem';

interface SkeletonLoaderProps {
  count: number;
}

const SkeletonLoader = ({ count }: SkeletonLoaderProps) => {
  const { theme } = useTheme();

  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            paddingHorizontal: commonTokens.spacing.md,
            marginBottom: commonTokens.spacing.lg,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surfaceSubtle,
              borderRadius: commonTokens.borderRadius.lg,
              padding: commonTokens.spacing.md,
              height: 200,
            }}
          />
        </View>
      ))}
    </View>
  );
};

// ─── Main Screen Component ──────────────────────────────────────────────────

export const ExploreScreen = ({ navigation }: ExploreScreenProps) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const screenWidth = Dimensions.get('window').width;

  // State
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Effects
  React.useEffect(() => {
    fetchCountries()
      .then((data) => {
        setCountries(data);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Computed
  const filteredCountries = React.useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return countries.filter((country) => {
      const matchesRegion = !selectedRegion || country.region === selectedRegion;
      const searchableText = getSearchableCountryText(country);

      return matchesRegion && searchableText.includes(normalizedQuery);
    });
  }, [countries, searchQuery, selectedRegion]);

  const itemWidth = (screenWidth - commonTokens.spacing.lg * 2) / GRID_COLUMNS;

  // Handlers
  const handleCountryPress = (country: Country) => {
    navigation.navigate('CountryDetails', { country });
  };

  const renderCountryItem: ListRenderItem<Country> = ({ item }) => (
    <CountryGridItem
      country={item}
      onPress={handleCountryPress}
      itemWidth={itemWidth}
      language={i18n.language}
    />
  );

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeIn}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: commonTokens.spacing.xxl,
      }}
    >
      <MaterialCommunityIcons
        name="map-search-outline"
        size={64}
        color={theme.colors.textTertiary}
        style={{ marginBottom: commonTokens.spacing.lg }}
      />
      <Text
        style={{
          fontSize: commonTokens.typography.displaySm.fontSize,
          fontFamily: commonTokens.typography.displaySm.fontFamily,
          fontWeight: '600',
          color: theme.colors.text,
          textAlign: 'center',
          paddingHorizontal: commonTokens.spacing.lg,
        }}
      >
        {t('exploreEmptyState')}
      </Text>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={theme.gradients.explore}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header Section */}
        <Animated.View
          entering={SlideInUp}
          style={{
            paddingHorizontal: commonTokens.spacing.lg,
            paddingTop: commonTokens.spacing.lg,
            paddingBottom: commonTokens.spacing.md,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: commonTokens.typography.display.fontSize,
              fontFamily: commonTokens.typography.display.fontFamily,
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: commonTokens.spacing.lg,
            }}
          >
            {t('exploreCountries')}
          </Text>

          {/* Search Input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.primaryLight,
              borderRadius: commonTokens.borderRadius.md,
              paddingHorizontal: commonTokens.spacing.md,
              borderWidth: 1,
              borderColor: theme.colors.primaryBorder,
              marginBottom: commonTokens.spacing.lg,
            }}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={theme.colors.primary}
              style={{ marginRight: commonTokens.spacing.sm }}
            />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: commonTokens.spacing.md,
                fontSize: commonTokens.typography.bodyLg.fontSize,
                fontFamily: commonTokens.typography.bodyLg.fontFamily,
                color: theme.colors.text,
              }}
              placeholder={t('searchCountryCapital')}
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Region Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingRight: commonTokens.spacing.lg,
              paddingLeft: 0,
            }}
          >
            {REGION_FILTERS.map((filter) => (
              <RegionChip
                key={filter.key}
                label={t(filter.labelKey)}
                isActive={selectedRegion === filter.value}
                onPress={() => setSelectedRegion(filter.value)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Country Grid */}
        {loading ? (
          <SkeletonLoader count={6} />
        ) : filteredCountries.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code3}
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={{
              paddingHorizontal: commonTokens.spacing.md,
            }}
            contentContainerStyle={{
              paddingVertical: commonTokens.spacing.lg,
            }}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default ExploreScreen;
