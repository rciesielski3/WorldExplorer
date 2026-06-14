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

  const filteredCountries = countries.filter((country) =>
    country.name?.common?.toLowerCase()?.startsWith(searchQuery.toLowerCase()),
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
              placeholder={t("searchEnterName")}
              placeholderTextColor={theme.colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
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
