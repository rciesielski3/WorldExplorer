import React, { useState, useEffect, useContext } from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  TextInput,
} from "react-native";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";

const ExploreScreen = ({ navigation }) => {
  const [countries, setCountries] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ State for search
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const styles = getStyles(theme);

  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all").then((response) => {
      setCountries(response.data);
    });
  }, []);

  // ✅ Filter countries based on searchQuery
  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("CountryDetails", { country: item })}
    >
      <View style={styles.card}>
        <Image source={{ uri: item.flags.png }} style={styles.flag} />
        <View style={styles.cardContent}>
          <Text style={styles.countryName}>{item.name.common}</Text>
          <Text style={styles.capitalText}>
            {t("capital")}: {item.capital}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.containerContent}>
        <Text style={styles.title}>{t("exploreCountries")}</Text>
        <Text style={styles.subtitle2}>{t("search")}</Text>
        <TextInput
          style={styles.searchBox}
          placeholder={t("searchEnterName")}
          placeholderTextColor={theme.colors.buttonText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.subtitle2}>{t("searchResults")}</Text>
        <FlatList
          data={filteredCountries}
          renderItem={renderItem}
          keyExtractor={(item) => item.cca3}
        />
      </View>
    </ImageBackground>
  );
};

export default ExploreScreen;
