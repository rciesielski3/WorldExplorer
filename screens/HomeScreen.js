import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";
import { API_URL } from "../constants";
import { getDailyCountry } from "../utils/dailyCountry";
import LottieView from "lottie-react-native";

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [dailyCountry, setDailyCountry] = React.useState(null);
  const [isDailyCountryLoading, setIsDailyCountryLoading] =
    React.useState(true);

  const { theme } = React.useContext(ThemeContext);
  const styles = getStyles(theme);

  React.useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        setDailyCountry(getDailyCountry(response.data));
      })
      .catch((error) => console.error("Error fetching daily country:", error))
      .finally(() => setIsDailyCountryLoading(false));
  }, []);

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <LottieView
          source={require("../assets/animations/explore.json")}
          autoPlay
          loop
          style={{
            width: 200,
            height: 200,
            alignSelf: "center",
          }}
        />
        <View style={styles.containerButtons}>
          <Text style={styles.title}>{t("welcome")} World Explorer</Text>
          <View style={styles.dailyCountryCard}>
            <Text style={styles.dailyCountryEyebrow}>
              {t("dailyCountry")}
            </Text>
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
                    source={{ uri: dailyCountry.flags.png }}
                    style={styles.dailyCountryFlag}
                  />
                  <View style={styles.dailyCountryText}>
                    <Text style={styles.countryName}>
                      {dailyCountry.name.common}
                    </Text>
                    <Text style={styles.settingDescription}>
                      {t("dailyCountrySubtitle", {
                        capital: dailyCountry.capital[0],
                      })}
                    </Text>
                    <Text style={styles.dailyCountryAction}>
                      {t("viewCountry")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <Text style={styles.settingDescription}>
                {t("dailyCountryUnavailable")}
              </Text>
            )}
          </View>
          <View style={{ width: "100%" }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Explore")}
            >
              <Text style={styles.buttonText}>{t("explore")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Map")}
            >
              <Text style={styles.buttonText}>{t("map")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Quiz")}
            >
              <Text style={styles.buttonText}>{t("quiz")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Settings")}
            >
              <Text style={styles.buttonText}>{t("settings")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;
