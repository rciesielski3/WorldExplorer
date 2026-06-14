import React from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";
import AdBanner from "../components/AdBanner";
import { API_URL } from "../constants";

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
};

const ExploreScreen = ({ navigation }) => {
  const [countries, setCountries] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRegion, setSelectedRegion] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { theme } = React.useContext(ThemeContext);

  const { t } = useTranslation();

  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const REGION_FILTERS = React.useMemo(
    () => [
      { label: t("regionAll"), value: null },
      { label: t("regionEurope"), value: "Europe" },
      { label: t("regionAsia"), value: "Asia" },
      { label: t("regionAmericas"), value: "Americas" },
      { label: t("regionAfrica"), value: "Africa" },
      { label: t("regionOceania"), value: "Oceania" },
    ],
    [t]
  );

  React.useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        setCountries(response.data);
      })
      .catch((error) => console.error("Error fetching countries:", error))
      .finally(() => setLoading(false));
  }, []);

  const filteredCountries = countries.filter((country) => {
    const matchesSearch = country.name?.common
      ?.toLowerCase()
      ?.startsWith(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion
      ? country.region === selectedRegion
      : true;

    return matchesSearch && matchesRegion;
  });

  const renderItem = React.useCallback(({ item }) => {
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
        <View style={styles.card}>
          <Image source={{ uri: item.flags?.png }} style={styles.flag} />
          <View style={styles.cardContent}>
            <Text style={styles.countryName}>{item.name?.common}</Text>
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
  }, [navigation, styles, theme.colors.text]);

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.containerContent}>
        <TouchableOpacity
          style={styles.exploreBackRow}
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.72}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={18}
            color={theme.colors.text}
          />
          <Text style={styles.exploreBackText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.exploreTitle}>{t("exploreCountries")}</Text>
        <View style={styles.searchInputWrap}>
          <MaterialCommunityIcons
            name="magnify"
            size={18}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.regionChips}
          contentContainerStyle={styles.regionChipsContent}
        >
          {REGION_FILTERS.map((region) => {
            const isActive = region.value === selectedRegion;

            return (
              <TouchableOpacity
                key={region.label}
                style={[
                  styles.regionChip,
                  isActive && styles.regionChipActive,
                ]}
                onPress={() => setSelectedRegion(region.value)}
                activeOpacity={0.72}
              >
                <Text
                  style={[
                    styles.regionChipText,
                    isActive && styles.regionChipTextActive,
                  ]}
                >
                  {region.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <FlatList
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={(item) => item.cca3}
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
