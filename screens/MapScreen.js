import React from "react";
import { View, Text, ImageBackground } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";

const MapScreen = ({ route }) => {
  const { isDarkMode, theme } = React.useContext(ThemeContext);

  const { t } = useTranslation();

  const styles = getStyles(theme);

  const { latitude, longitude, countryName } = route.params || {
    latitude: 51.9194,
    longitude: 19.1451,
    countryName: t("worldMap"),
  };

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.mapContainer}>
        <Text style={styles.title}>{countryName}</Text>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 30,
            longitudeDelta: 30,
          }}
        >
          <Marker coordinate={{ latitude, longitude }} title={countryName} />
        </MapView>
      </View>
    </ImageBackground>
  );
};

export default MapScreen;
