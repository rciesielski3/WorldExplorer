import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";
import { getDailyCountry } from "../utils/dailyCountry";
import { fetchCountries, getLocalizedCountryName } from "../utils/countries";
import { FLAG_ASSETS } from "../utils/flagAssets";
import LottieView from "lottie-react-native";

const HomeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [dailyCountry, setDailyCountry] = React.useState(null);
  const [isDailyCountryLoading, setIsDailyCountryLoading] =
    React.useState(true);

  const { theme } = React.useContext(ThemeContext);
  const styles = getStyles(theme);

  const HOME_ACTIONS = [
    {
      key: "explore",
      icon: "earth",
      label: t("explore"),
      subtitle: t("homeExploreSubtitle"),
      screen: "Explore",
    },
    {
      key: "map",
      icon: "map-outline",
      label: t("map"),
      subtitle: t("homeMapSubtitle"),
      screen: "Map",
    },
    {
      key: "quiz",
      icon: "puzzle-outline",
      label: t("quiz"),
      subtitle: t("homeQuizSubtitle"),
      screen: "Quiz",
    },
    {
      key: "settings",
      icon: "cog-outline",
      label: t("settings"),
      subtitle: t("homeSettingsSubtitle"),
      screen: "Settings",
    },
  ];

  React.useEffect(() => {
    fetchCountries()
      .then((countriesData) => {
        setDailyCountry(getDailyCountry(countriesData));
      })
      .catch((error) => console.error("Error fetching daily country:", error))
      .finally(() => setIsDailyCountryLoading(false));
  }, []);

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <ScrollView
        style={styles.homeScroll}
        contentContainerStyle={styles.homeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeHero}>
          <LottieView
            source={require("../assets/animations/explore.json")}
            autoPlay
            loop
            style={styles.homeGlobe}
          />
          <Text style={styles.homeEyebrow}>World Explorer</Text>
          <Text style={styles.homeTitle}>{t("welcome")} World Explorer</Text>
          <Text style={styles.homeSubtitle}>{t("homeHeroSubtitle")}</Text>
        </View>

        <View style={styles.homeQuickActions}>
          <View style={styles.homeActionGrid}>
            {HOME_ACTIONS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.homeActionCard}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.78}
              >
                <View style={styles.homeActionIcon}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.homeActionTitle}>{item.label}</Text>
                <Text style={styles.homeActionSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dailyCountryCard}>
          <View style={styles.dailyCountryHeader}>
            <Text style={styles.dailyCountryEyebrow}>{t("dailyCountry")}</Text>
            <MaterialCommunityIcons
              name="sparkles"
              size={18}
              color={theme.colors.button}
            />
          </View>
          {isDailyCountryLoading ? (
            <ActivityIndicator
              color={theme.colors.button}
              style={styles.dailyCountryLoader}
            />
          ) : dailyCountry ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CountryDetails", {
                  country: dailyCountry,
                })
              }
            >
              <View style={styles.dailyCountryContent}>
                <Image
                  source={FLAG_ASSETS[dailyCountry.flagPath]}
                  style={styles.dailyCountryFlag}
                />
                <View style={styles.dailyCountryText}>
                  <Text style={styles.countryName}>
                    {getLocalizedCountryName(dailyCountry, i18n.language)}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {t("dailyCountrySubtitle", {
                      capital: dailyCountry.capital,
                    })}
                  </Text>
                  <View style={styles.dailyCountryActionRow}>
                    <Text style={styles.dailyCountryAction}>
                      {t("viewCountry")}
                    </Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={16}
                      color={theme.colors.button}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={styles.settingDescription}>
              {t("dailyCountryUnavailable")}
            </Text>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default HomeScreen;
