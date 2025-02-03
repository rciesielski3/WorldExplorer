import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useTranslation } from "react-i18next";

const CountryDetailsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();

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
      <ScrollView style={styles.container}>
        <Image source={{ uri: country.flags.png }} style={styles.flag} />
        <Text style={styles.title}>{country.name.common}</Text>
        <View style={styles.details}>
          <Text>
            {t("capital")}: {country.capital}
          </Text>
          <Text>
            {t("population")}: {country.population.toLocaleString()}
          </Text>
          <Text>
            {t("region")}: {country.region}
          </Text>
          <Text>
            {t("subregion")}: {country.subregion}
          </Text>
          <Text>
            {t("languages")}: {Object.values(country.languages).join(", ")}
          </Text>
          <Text>
            {t("currency")}:{" "}
            {Object.values(country.currencies)
              .map((c) => c.name)
              .join(", ")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={handleShowOnMap}
        >
          <Text style={styles.buttonText}>{t("showOnMap")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(189, 189, 189, 0.43)",
  },
  flag: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  details: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: "center",
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default CountryDetailsScreen;
