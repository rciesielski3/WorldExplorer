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
import axios from "axios";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";
import AdBanner from "../components/AdBanner";
import { API_URL } from "../constants";

<<<<<<< HEAD
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
=======
const formatPopulation = (population) => {
  if (!population) {
    return "";
  }

  if (population >= 1000000) {
    return `${Math.round(population / 1000000)}M`;
  }

  if (population >= 1000) {
    return `${Math.round(population / 1000)}K`;
  }

  return String(population);
>>>>>>> main
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
    axios
      .get(API_URL)
      .then((response) => {
        setCountries(response.data);
      })
      .catch((error) => console.error("Error fetching countries:", error))
      .finally(() => setLoading(false));
  }, []);

  const filteredCountries = React.useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return countries.filter((country) => {
      const matchesRegion =
        !selectedRegion || country.region === selectedRegion;
      const searchableText = [
        country.name?.common?.toLowerCase(),
        country.capital?.[0]?.toLowerCase(),
      ]
        .filter(Boolean)
        .join(" ");

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
      item.capital?.[0],
      item.region,
      formatPopulation(item.population),
    ].filter(Boolean);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("CountryDetails", { country: item })}
        activeOpacity={0.78}
      >
<<<<<<< HEAD
        <View style={styles.countryCard}>
          <Image source={{ uri: item.flags?.png }} style={styles.countryCardFlag} />
          <View style={styles.cardContent}>
            <Text style={styles.countryName}>{item.name?.common}</Text>
            <Text style={styles.countryCardMeta}>
              {metadata.join(" · ")}
            </Text>
=======
        <View style={styles.card}>
          <Image source={{ uri: item.flags?.png }} style={styles.flag} />
          <View style={styles.cardContent}>
            <Text style={styles.countryName}>{item.name?.common}</Text>
            <Text style={styles.countryMetaText}>{metadata.join(" · ")}</Text>
>>>>>>> main
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
<<<<<<< HEAD
        <View style={styles.exploreHeaderRow}>
          <Text style={styles.title}>{t("exploreCountries")}</Text>
        </View>

        <View style={styles.exploreSearchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={theme.colors.text}
          />
          <TextInput
            style={styles.exploreSearchInput}
            placeholder={t("searchCountryCapital")}
            placeholderTextColor={theme.colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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

=======
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
              placeholder={t("searchEnterName")}
              placeholderTextColor={theme.colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
>>>>>>> main
        {loading ? (
          renderSkeletonRows()
        ) : (
          <FlatList
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={(item) => item.cca3}
<<<<<<< HEAD
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyStateText}>{t("noCountriesFound")}</Text>
            }
=======
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
>>>>>>> main
          />
        )}
      </View>
      <AdBanner />
    </ImageBackground>
  );
};

export default ExploreScreen;
