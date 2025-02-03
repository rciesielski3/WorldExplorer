import React from "react";
import { View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";

import { styles } from "../styles";

const MapScreen = ({ route }) => {
  const { t } = useTranslation();

  const { latitude, longitude, countryName } = route.params || {
    latitude: 51.9194,
    longitude: 19.1451,
    countryName: t("worldMap"),
  };

  return (
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
  );
};

export default MapScreen;
