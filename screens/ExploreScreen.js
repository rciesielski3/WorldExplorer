import React from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { styles } from "../styles";

const ExploreScreen = ({ navigation }) => {
  const [countries, setCountries] = React.useState([]);
  const { t } = useTranslation();

  React.useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all").then((response) => {
      setCountries(response.data);
    });
  }, []);

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
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>{t("exploreCountries")}</Text>
        <FlatList
          data={countries}
          renderItem={renderItem}
          keyExtractor={(item) => item.cca3}
        />
      </View>
    </ImageBackground>
  );
};

export default ExploreScreen;
