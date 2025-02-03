import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";

const CountryDetailsScreen = ({ route, navigation }) => {
  const { theme } = React.useContext(ThemeContext);

  const { t } = useTranslation();
  const styles = getStyles(theme);

  const { country } = route.params;

  const handleShowOnMap = () => {
    navigation.navigate("Map", {
      latitude: country.latlng[0],
      longitude: country.latlng[1],
      countryName: country.name.common,
    });
  };

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.containerScrollView}
        contentContainerStyle={{
          justifyContent: "center",
        }}
      >
        <View style={styles.innerContainer}>
          <Image
            source={{ uri: country.flags.png }}
            style={styles.flagCountryDetails}
          />
          <Text style={styles.title}>{country.name.common}</Text>
          <View style={styles.detailsCountryDetails}>
            <Text style={styles.capitalText}>{t("capital")}:</Text>
            <Text style={styles.countryName}>{country.capital}</Text>
            <Text style={styles.capitalText}>{t("population")}: </Text>
            <Text style={styles.countryName}>
              {country.population.toLocaleString()}
            </Text>
            <Text style={styles.capitalText}>{t("region")}: </Text>
            <Text style={styles.countryName}>{country.region}</Text>
            <Text style={styles.capitalText}>{t("subregion")}:</Text>
            <Text style={styles.countryName}>{country.subregion}</Text>
            <Text style={styles.capitalText}>{t("languages")}: </Text>
            <Text style={styles.countryName}>
              {Object.values(country.languages).join(", ")}
            </Text>
            <Text style={styles.capitalText}>{t("currency")}: </Text>
            <Text style={styles.countryName}>
              {Object.values(country.currencies)
                .map((c) => c.name)
                .join(", ")}
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleShowOnMap}>
            <Text style={styles.buttonText}>{t("showOnMap")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default CountryDetailsScreen;
