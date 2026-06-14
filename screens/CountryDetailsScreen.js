import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";
import AdBanner from "../components/AdBanner";

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
  if (!currencies) {
    return null;
  }

  return Object.values(currencies)
    .map((currency) =>
      [currency?.name, currency?.symbol].filter(Boolean).join(" ")
    )
    .filter(Boolean)
    .join(", ");
};

const formatLanguages = (languages) => {
  if (!languages) {
    return null;
  }

  return Object.values(languages).filter(Boolean).join(", ");
};

const getCoordinates = (country) => ({
  latitude: country?.latlng?.[0] ?? 0,
  longitude: country?.latlng?.[1] ?? 0,
});

const CountryDetailsScreen = ({ route, navigation }) => {
  const { theme } = React.useContext(ThemeContext);
  const { t } = useTranslation();
  const styles = getStyles(theme);
  const [activeTab, setActiveTab] = React.useState("info");

  const { country } = route.params;
  const coordinates = getCoordinates(country);
  const countryName = country.name?.common ?? t("countryDetails");
  const capital = country.capital?.[0] ?? t("noData");
  const population = formatPopulation(country.population) ?? t("noData");
  const currencies = formatCurrencies(country.currencies) ?? t("noData");
  const languages = formatLanguages(country.languages) ?? t("noData");
  const regionLine = [country.region, country.subregion].filter(Boolean).join(" · ");

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
      label: t("topLevelDomain"),
      value: country.tld?.join(", ") ?? t("noData"),
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
    <View style={styles.countryStatGrid}>
      {items.map((item) => (
        <View key={item.label} style={styles.countryStatCard}>
          <Text style={styles.countryStatLabel}>{item.label}</Text>
          <Text style={styles.countryStatValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );

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
        <TouchableOpacity
          style={styles.countryBackRow}
          onPress={() => navigation.goBack()}
          activeOpacity={0.78}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={theme.colors.text}
          />
          <Text style={styles.countryBackText}>{t("back")}</Text>
        </TouchableOpacity>

        <View style={styles.countryHeroCard}>
          <Image
            source={{ uri: country.flags?.png }}
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

        <View style={styles.countryTabRow}>
          {DETAIL_TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.countryTab,
                  isActive && styles.countryTabActive,
                ]}
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
            {renderStatGrid(infoStats)}
            <View style={styles.countryFactCard}>
              <View style={styles.countryFactHeader}>
                <MaterialCommunityIcons
                  name="sparkles"
                  size={14}
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

        <TouchableOpacity
          style={styles.button}
          onPress={handleShowOnMap}
          activeOpacity={0.82}
        >
          <View style={styles.countryCtaContent}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color={theme.colors.buttonText}
            />
            <Text style={styles.buttonText}>{t("showOnMap")}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <AdBanner />
    </ImageBackground>
  );
};

export default CountryDetailsScreen;
