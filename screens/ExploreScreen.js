import React from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";
import AdBanner from "../components/AdBanner";
import { fetchCountries } from "../utils/countries";

const REGION_FILTERS = [
  { key: "all", labelKey: "allCountries", value: null },
  { key: "europe", labelKey: "regionEurope", value: "Europe" },
  { key: "asia", labelKey: "regionAsia", value: "Asia" },
  { key: "americas", labelKey: "regionAmericas", value: "Americas" },
  { key: "africa", labelKey: "regionAfrica", value: "Africa" },
  { key: "oceania", labelKey: "regionOceania", value: "Oceania" },
];

const formatPopulation = (population) => {
  if (!Number.isFinite(population)) {
    return null;
  }

  if (population >= 1_000_000) {
    return `${Math.round(population / 1_000_000)}M`;
  }

  if (population >= 1_000) {
    return `${Math.round(population / 1_000)}K`;
  }

  return population.toLocaleString();
};

const ExploreScreen = ({ navigation }) => {
  const [countries, setCountries] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRegion, setSelectedRegion] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { theme } = React.useContext(ThemeContext);

  const { t } = useTranslation();
  const styles = getStyles(theme);

  React.useEffect(() => {
    fetchCountries()
      .then((countriesData) => {
        setCountries(countriesData);
      })
      .catch((error) => console.error("Error fetching countries:", error))
      .finally(() => setLoading(false));
  }, []);

  const filteredCountries = React.useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return countries.filter((country) => {
      const matchesRegion =
        !selectedRegion || country.region === selectedRegion;
      const searchableText = getSearchableCountryText(country);

      return matchesRegion && searchableText.includes(normalizedQuery);
    });
  }, [countries, searchQuery, selectedRegion]);

  const renderSkeletonRows = () => (
    <View>
      {Array.from({ length: 7 }).map((_, index) => (
        <View key={index} style={styles.skeletonRow}>
          <View style={styles.skeletonFlag} />
          <View style={styles.skeletonTextColumn}>
            <View style={styles.skeletonTitleLine} />
            <View style={styles.skeletonMetaLine} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }) => {
    const metadata = [
      item.capital,
      item.region,
      formatPopulation(item.population),
    ].filter(Boolean);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("CountryDetails", { country: item })}
        activeOpacity={0.78}
      >
        <View style={styles.countryCard}>
          <Image
            source={require(`../assets/flags/${item.flagPath}`)}
            style={styles.countryCardFlag}
          />
          <View style={styles.cardContent}>
            <Text style={styles.countryName}>
              {getLocalizedCountryName(item, i18n.language)}
            </Text>
            <Text style={styles.countryMetaText}>{metadata.join(" · ")}</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={theme.colors.text}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.containerContent}>
        <View style={styles.exploreHeaderCard}>
          <Text style={styles.title}>{t("exploreCountries")}</Text>
          <Text style={styles.subtitle2}>{t("homeHeroSubtitle")}</Text>
          <View style={styles.searchInputWrap}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={theme.colors.text}
            />
            <TextInput
              style={styles.searchBox}
              placeholder={t("searchCountryCapital")}
              placeholderTextColor={theme.colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.regionFilterRow}
          contentContainerStyle={styles.regionFilterContent}
        >
          {REGION_FILTERS.map((filter) => {
            const isActive = selectedRegion === filter.value;

            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.regionFilterChip,
                  isActive && styles.regionFilterChipActive,
                ]}
                onPress={() => setSelectedRegion(filter.value)}
                activeOpacity={0.78}
              >
                <Text
                  style={[
                    styles.regionFilterChipText,
                    isActive && styles.regionFilterChipTextActive,
                  ]}
                >
                  {t(filter.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          renderSkeletonRows()
        ) : (
          <FlatList
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={(item) => item.code3}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.exploreEmptyState}>
                <MaterialCommunityIcons
                  name="map-search-outline"
                  size={32}
                  color={theme.colors.text}
                />
                <Text style={styles.settingDescription}>
                  {t("exploreEmptyState")}
                </Text>
              </View>
            }
            contentContainerStyle={styles.exploreListContent}
          />
        )}
      </View>
      <AdBanner />
    </ImageBackground>
  );
};

export default ExploreScreen;
