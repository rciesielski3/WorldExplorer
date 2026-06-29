import React from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";
import AdBanner from "../components/AdBanner";
import { FLAG_ASSETS } from "../utils/flagAssets";

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#163759" }],
  },
];

const getInitialRouteData = (route, fallbackName) => {
  const country = route?.params?.country;
  const latitude = route?.params?.latitude ?? country?.lat ?? 51.9194;
  const longitude = route?.params?.longitude ?? country?.lng ?? 19.1451;
  const countryName =
    route?.params?.countryName ?? country?.name ?? fallbackName;

  return {
    country,
    latitude,
    longitude,
    countryName,
  };
};

const MapTooltip = ({ country, countryName, theme, styles, t }) => {
  const meta = [country?.capital, country?.region].filter(Boolean);

  return (
    <View style={styles.mapTooltip}>
      {country?.flagPath ? (
        <Image
          source={FLAG_ASSETS[country.flagPath]}
          style={styles.mapTooltipFlag}
        />
      ) : null}
      <View style={styles.mapTooltipText}>
        <Text style={styles.mapTooltipName}>{countryName}</Text>
        <Text style={styles.mapTooltipMeta}>
          {meta.length ? meta.join(" · ") : t("selectedCountry")}
        </Text>
      </View>
    </View>
  );
};

const LegendItem = ({ color, label, outline, styles }) => (
  <View style={styles.mapLegendItem}>
    <View
      style={[
        styles.mapLegendDot,
        outline ? styles.mapLegendDotOutline : { backgroundColor: color },
      ]}
    />
    <Text style={styles.mapLegendText}>{label}</Text>
  </View>
);

const MapScreen = ({ route, navigation }) => {
  const { theme } = React.useContext(ThemeContext);
  const { t } = useTranslation();
  const styles = getStyles(theme);
  const mapRef = React.useRef(null);
  const { country, latitude, longitude, countryName } = getInitialRouteData(
    route,
    t("worldMap"),
  );
  const initialRegion = React.useMemo(
    () => ({
      latitude,
      longitude,
      latitudeDelta: country ? 14 : 30,
      longitudeDelta: country ? 14 : 30,
    }),
    [country, latitude, longitude],
  );
  const [region, setRegion] = React.useState(initialRegion);
  const regionRef = React.useRef(initialRegion);

  const animateToRegion = React.useCallback((nextRegion) => {
    regionRef.current = nextRegion;
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 280);
  }, []);

  const handleZoom = React.useCallback(
    (direction) => {
      const currentRegion = regionRef.current;
      const factor = direction === "in" ? 0.62 : 1.38;
      const nextRegion = {
        ...currentRegion,
        latitudeDelta: Math.min(
          Math.max(currentRegion.latitudeDelta * factor, 2),
          80,
        ),
        longitudeDelta: Math.min(
          Math.max(currentRegion.longitudeDelta * factor, 2),
          80,
        ),
      };

      animateToRegion(nextRegion);
    },
    [animateToRegion],
  );

  const handleResetMap = React.useCallback(() => {
    animateToRegion(initialRegion);
  }, [animateToRegion, initialRegion]);

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.mapContent}>
        <TouchableOpacity
          style={styles.mapHeaderRow}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.78}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={theme.colors.text}
          />
          <Text style={styles.countryBackText}>{t("back")}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{countryName}</Text>

        <View style={styles.mapShell}>
          <MapView
            ref={mapRef}
            style={styles.mapView}
            customMapStyle={theme.isDarkMode ? DARK_MAP_STYLE : []}
            initialRegion={initialRegion}
            onRegionChangeComplete={(newRegion) => {
              regionRef.current = newRegion;
              setRegion(newRegion);
            }}
          >
            <Marker coordinate={{ latitude, longitude }}>
              <View style={styles.mapPin}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={34}
                  color={theme.colors.button}
                />
              </View>
              <Callout tooltip>
                <MapTooltip
                  country={country}
                  countryName={countryName}
                  theme={theme}
                  styles={styles}
                  t={t}
                />
              </Callout>
            </Marker>
          </MapView>

          <View style={styles.mapControls}>
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={() => handleZoom("in")}
              accessibilityLabel={t("zoomIn")}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={() => handleZoom("out")}
              accessibilityLabel={t("zoomOut")}
            >
              <MaterialCommunityIcons
                name="minus"
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={handleResetMap}
              accessibilityLabel={t("resetMap")}
            >
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={20}
                color={theme.colors.button}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mapLegend}>
          <LegendItem
            color={theme.colors.button}
            label={t("selectedCountry")}
            styles={styles}
          />
          <LegendItem
            color="#14B8A6"
            label={t("visitedCountry")}
            styles={styles}
          />
          <LegendItem label={t("unvisitedCountry")} outline styles={styles} />
        </View>
      </View>
      <AdBanner />
    </ImageBackground>
  );
};

export default MapScreen;
