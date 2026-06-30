import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";
import AdBanner from "../components/AdBanner";
import { FLAG_ASSETS } from "../utils/flagAssets";

const DETAIL_TABS = [
  { key: "info", labelKey: "countryInfo" },
  { key: "stats", labelKey: "countryStats" },
  { key: "map", labelKey: "countryMap" },
];

const formatNumber = (value) => {
  if (!Number.isFinite(value)) {
    return null;
  }

  return value.toLocaleString();
};

const formatPopulation = (population) => {
  if (!Number.isFinite(population)) {
    return null;
  }

  if (population >= 1_000_000) {
    return `${(population / 1_000_000).toFixed(1)}M`;
  }

  if (population >= 1_000) {
    return `${Math.round(population / 1_000)}K`;
  }

  return population.toLocaleString();
};

const formatCurrencies = (currencies) => {
  if (!currencies?.length) {
    return null;
  }

  return currencies.join(", ");
};

const formatLanguages = (languages) => {
  if (!languages?.length) {
    return null;
  }

  return languages.join(", ");
};

const getCoordinates = (country) => ({
  latitude: country?.lat ?? 0,
  longitude: country?.lng ?? 0,
});

const CountryDetailsScreen = ({ route, navigation }) => {
  const { theme } = React.useContext(ThemeContext);
  const { t } = useTranslation();
  const styles = getStyles(theme);
  const [activeTab, setActiveTab] = React.useState("info");

  const { country } = route.params;
  const coordinates = getCoordinates(country);
  const countryName = country.translations?.en?.name ?? t("countryDetails");
  const capital = country.capital ?? t("noData");
  const population = formatPopulation(country.population) ?? t("noData");
  const currencies = formatCurrencies(country.currencies) ?? t("noData");
  const languages = formatLanguages(country.languages) ?? t("noData");
  const regionLine = [country.region, country.subregion]
    .filter(Boolean)
    .join(" · ");

  const infoStats = [
    { label: t("capital"), value: capital },
    { label: t("population"), value: population },
    { label: t("currency"), value: currencies },
    { label: t("languages"), value: languages },
  ];

  const extendedStats = [
    { label: t("region"), value: country.region ?? t("noData") },
    { label: t("subregion"), value: country.subregion ?? t("noData") },
    {
      label: t("area"),
      value: country.area ? `${formatNumber(country.area)} km²` : t("noData"),
    },
    {
      label: t("timezones"),
      value: country.timezones?.join(", ") ?? t("noData"),
    },
    {
      label: t("borders"),
      value: country.borders?.join(", ") ?? t("noData"),
    },
  ];

  const handleShowOnMap = () => {
    navigation.navigate("Map", {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      countryName,
      country,
    });
  };

  const renderStatGrid = (items) => (
    <View style={styles.countryStatGridContainer}>
      <View style={styles.countryStatGrid}>
        {items.map((item) => (
          <View key={item.label} style={styles.countryStatCard}>
            <View style={styles.countryStatCardContent}>
              <Text style={styles.countryStatLabel}>{item.label}</Text>
              <Text style={styles.countryStatValue} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderInfoCard = (title, value, icon) => (
    <View style={styles.countryInfoCard}>
      <View style={styles.countryInfoCardHeader}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={theme.colors.button}
            style={styles.countryInfoCardIcon}
          />
        )}
        <Text style={styles.countryInfoCardTitle}>{title}</Text>
      </View>
      <Text style={styles.countryInfoCardValue}>{value}</Text>
    </View>
  );

  const handleNavigateToSettings = () => {
    navigation.navigate("Settings");
  };

  const handleNavigateToQuiz = () => {
    navigation.navigate("Quiz", { country });
  };

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.containerScrollView}
        contentContainerStyle={styles.countryDetailsContent}
      >
        <View style={[styles.countryBackRow, styles.countryTopBar]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
            style={styles.countryTopBarButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.countryBackText}>{t("back")}</Text>
          <View style={styles.countryTopBarSpacer} />
          <TouchableOpacity
            onPress={handleNavigateToSettings}
            activeOpacity={0.6}
            style={styles.countryTopBarButton}
          >
            <MaterialCommunityIcons
              name="cog"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.countryHeroSection}>
          <View style={styles.countryHeroCard}>
            <Image
              source={FLAG_ASSETS[country.flagPath]}
              style={styles.countryHeroFlag}
              resizeMode="cover"
            />
            <View style={styles.countryHeroOverlay} />
            <View style={styles.countryHeroText}>
              <Text style={styles.countryHeroName}>{countryName}</Text>
              <Text style={styles.countryHeroRegion}>
                {regionLine || t("noData")}
              </Text>
            </View>
          </View>

          <View style={styles.countryHeaderCard}>
            <View>
              <Text style={styles.countryHeaderName}>{countryName}</Text>
              <Text style={styles.countryHeaderCapital}>
                {t("capital")}: {capital}
              </Text>
            </View>
            <View style={styles.countryRegionBadge}>
              <Text style={styles.countryRegionBadgeText}>
                {country.region ?? t("noData")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.countryTabRow}>
          {DETAIL_TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.countryTab, isActive && styles.countryTabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.78}
              >
                <Text
                  style={[
                    styles.countryTabText,
                    isActive && styles.countryTabTextActive,
                  ]}
                >
                  {t(tab.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === "info" && (
          <View>
            <View style={styles.countryInfoSection}>
              {renderInfoCard(t("population"), population, "people")}
              {renderInfoCard(t("area"), `${formatNumber(country.area) ?? t("noData")} km²`, "map")}
              {renderInfoCard(t("languages"), languages, "translate")}
            </View>

            <View style={styles.countryFactCard}>
              <View style={styles.countryFactHeader}>
                <MaterialCommunityIcons
                  name="sparkles"
                  size={16}
                  color={theme.colors.button}
                />
                <Text style={styles.countryFactLabel}>{t("countryFact")}</Text>
              </View>
              <Text style={styles.countryFactText}>
                {t("countryFactText", {
                  country: countryName,
                  region: country.region ?? t("noData"),
                  capital,
                })}
              </Text>
            </View>
          </View>
        )}

        {activeTab === "stats" && renderStatGrid(extendedStats)}

        {activeTab === "map" && (
          <View style={styles.countryMiniMapCard}>
            <MapView
              style={styles.countryMiniMap}
              initialRegion={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                latitudeDelta: 20,
                longitudeDelta: 20,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={coordinates} title={countryName} />
            </MapView>
          </View>
        )}

        <View style={styles.countryCtaSection}>
          <TouchableOpacity
            style={[styles.button, styles.countryQuizButton]}
            onPress={handleNavigateToQuiz}
            activeOpacity={0.82}
          >
            <View style={styles.countryCtaContent}>
              <MaterialCommunityIcons
                name="brain"
                size={20}
                color={theme.colors.buttonText}
              />
              <Text style={styles.buttonText}>{t("testKnowledge") || "Test Your Knowledge"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.countryMapButton]}
            onPress={handleShowOnMap}
            activeOpacity={0.82}
          >
            <View style={styles.countryCtaContent}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={theme.colors.buttonText}
              />
              <Text style={styles.buttonText}>{t("showOnMap")}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AdBanner />
    </ImageBackground>
  );
};

export default CountryDetailsScreen;
