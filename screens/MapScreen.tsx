import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { StackScreenProps } from "@react-navigation/stack";

import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../styles";
import { commonTokens, fixedColors } from "../theme/tokens";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { FLAG_ASSETS } from "../utils/flagAssets";
import { logger } from "../utils/logger";
import { triggerLightHaptic } from "../utils/haptics";
import { getLocalizedCountryName } from "../utils/countries";
import type { RootStackParamList } from "../types/navigation";

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: fixedColors.mapDark.geometry }] },
  { elementType: "labels.text.fill", stylers: [{ color: fixedColors.mapDark.labelFill }] },
  { elementType: "labels.text.stroke", stylers: [{ color: fixedColors.mapDark.labelStroke }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: fixedColors.mapDark.water }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: fixedColors.mapDark.road }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: fixedColors.mapDark.administrative }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: fixedColors.mapDark.landscape }],
  },
];

interface CountryData {
  name: string;
  capital?: string;
  region?: string;
  flagPath?: string;
  lat?: number;
  lng?: number;
}

type MapScreenProps = StackScreenProps<RootStackParamList, "Map">;

const getInitialRouteData = (
  route: MapScreenProps["route"],
  fallbackName: string,
  language: string,
) => {
  const rawCountry = route?.params?.country;
  const country: CountryData | undefined = rawCountry
    ? {
        name: getLocalizedCountryName(rawCountry, language) ?? fallbackName,
        capital: rawCountry.capital,
        region: rawCountry.region,
        flagPath: rawCountry.flagPath,
        lat: rawCountry.lat,
        lng: rawCountry.lng,
      }
    : undefined;
  const latitude = route?.params?.latitude ?? country?.lat ?? 51.9194;
  const longitude = route?.params?.longitude ?? country?.lng ?? 19.1451;
  const countryName = route?.params?.countryName ?? country?.name ?? fallbackName;

  return {
    country,
    latitude,
    longitude,
    countryName,
  };
};

const CountryInfoCard = ({
  country,
  countryName,
  isVisible,
  onClose,
  theme,
  animationValue,
  windowWidth,
  insetLeft,
  insetRight,
}: {
  country?: CountryData;
  countryName: string;
  isVisible: boolean;
  onClose: () => void;
  theme: any;
  animationValue: Animated.Value;
  windowWidth: number;
  insetLeft: number;
  insetRight: number;
}) => {
  const { t } = useTranslation();
  const translateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });
  // Cap the card width on wide screens and keep it centered.
  const availableWidth = windowWidth - insetLeft - insetRight;
  const cardWidth = Math.min(availableWidth, commonTokens.layout.maxContentWidth);

  if (!isVisible) return null;

  const meta = [country?.capital, country?.region].filter(Boolean);

  return (
    <Animated.View
      testID="map-info-card"
      style={[
        styles.infoCard,
        {
          shadowColor: theme.colors.shadow,
          width: cardWidth,
          left: insetLeft + (availableWidth - cardWidth) / 2,
          right: undefined,
          transform: [{ translateY }],
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.infoCardClose}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t("a11yCloseCountryInfo")}
        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
      >
        <MaterialCommunityIcons name="close" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.infoCardContent}>
        {country?.flagPath ? (
          <Image source={FLAG_ASSETS[country.flagPath]} style={styles.infoCardFlag} />
        ) : null}

        <View style={styles.infoCardText}>
          <Text style={[styles.infoCardName, { color: theme.colors.text }]}>{countryName}</Text>
          {meta.length > 0 ? (
            <Text style={[styles.infoCardMeta, { color: theme.colors.text }]}>
              {meta.join(" · ")}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

const FAB = ({
  icon,
  onPress,
  label,
  theme,
}: {
  icon: string;
  onPress: () => void;
  label: string;
  theme: any;
}) => {
  const handlePress = () => {
    triggerLightHaptic();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          shadowColor: theme.colors.shadow,
          backgroundColor: theme.colors.button,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons name={icon} size={24} color={theme.colors.onAccent} />
    </TouchableOpacity>
  );
};

const TopBar = ({
  title,
  onBackPress,
  theme,
  insets,
}: {
  title: string;
  onBackPress: () => void;
  theme: any;
  insets: any;
}) => {
  const { t } = useTranslation();
  return (
  <View
    style={[
      styles.topBar,
      {
        backgroundColor: theme.isDarkMode ? "rgba(11, 11, 22, 0.95)" : "rgba(248, 250, 252, 0.95)",
        borderColor: theme.colors.border,
        paddingTop: insets.top || 12,
      },
    ]}
  >
    <TouchableOpacity
      onPress={onBackPress}
      accessibilityRole="button"
      accessibilityLabel={t("a11yGoBack")}
      activeOpacity={0.7}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      style={styles.topBarButton}
    >
      <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
    </TouchableOpacity>
    <Text style={[styles.topBarTitle, { color: theme.colors.text }]}>{title}</Text>
    <View style={styles.topBarSpacer} />
  </View>
  );
};

const MapScreen: React.FC<MapScreenProps> = ({ route, navigation }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const { country, latitude, longitude, countryName } = getInitialRouteData(
    route,
    t("worldMap"),
    i18n.language,
  );

  const initialRegion = useMemo(
    () => ({
      latitude,
      longitude,
      latitudeDelta: country ? 14 : 30,
      longitudeDelta: country ? 14 : 30,
    }),
    [country, latitude, longitude],
  );

  const [region, setRegion] = useState(initialRegion);
  const regionRef = useRef(initialRegion);
  const [selectedMarker, setSelectedMarker] = useState<CountryData | null>(null);
  const animationValue = useRef(new Animated.Value(0)).current;

  const animateToRegion = useCallback((nextRegion: any) => {
    regionRef.current = nextRegion;
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 280);
  }, []);

  const handleZoomIn = useCallback(() => {
    const currentRegion = regionRef.current;
    const nextRegion = {
      ...currentRegion,
      latitudeDelta: Math.min(Math.max(currentRegion.latitudeDelta * 0.62, 2), 80),
      longitudeDelta: Math.min(Math.max(currentRegion.longitudeDelta * 0.62, 2), 80),
    };
    animateToRegion(nextRegion);
  }, [animateToRegion]);

  const handleZoomOut = useCallback(() => {
    const currentRegion = regionRef.current;
    const nextRegion = {
      ...currentRegion,
      latitudeDelta: Math.min(Math.max(currentRegion.latitudeDelta * 1.38, 2), 80),
      longitudeDelta: Math.min(Math.max(currentRegion.longitudeDelta * 1.38, 2), 80),
    };
    animateToRegion(nextRegion);
  }, [animateToRegion]);

  const handleResetMap = useCallback(() => {
    animateToRegion(initialRegion);
  }, [animateToRegion, initialRegion]);

  const showInfoCard = useCallback(
    (markerCountry: CountryData) => {
      setSelectedMarker(markerCountry);
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    },
    [animationValue],
  );

  const hideInfoCard = useCallback(() => {
    Animated.timing(animationValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedMarker(null);
    });
  }, [animationValue]);

  const handleMarkerPress = useCallback(() => {
    if (country) {
      showInfoCard(country);
    }
  }, [country, showInfoCard]);

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScreenBackground gradient="map" />
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
        <Marker coordinate={{ latitude, longitude }} onPress={handleMarkerPress}>
          <View style={styles.mapPin}>
            <MaterialCommunityIcons name="map-marker" size={34} color={theme.colors.button} />
          </View>
        </Marker>
      </MapView>

      <TopBar title={countryName} onBackPress={handleBackPress} theme={theme} insets={insets} />

      <View
        testID="map-fab-container"
        style={[
          styles.fabContainer,
          {
            right: commonTokens.spacing.md + insets.right,
            bottom: insets.bottom + (isLandscape ? commonTokens.spacing.lg : 100),
          },
        ]}
      >
        <FAB icon="plus" onPress={handleZoomIn} label={t("zoomIn")} theme={theme} />
        <FAB icon="minus" onPress={handleZoomOut} label={t("zoomOut")} theme={theme} />
        <FAB icon="crosshairs-gps" onPress={handleResetMap} label={t("resetMap")} theme={theme} />
      </View>

      <CountryInfoCard
        country={selectedMarker || country}
        countryName={selectedMarker ? selectedMarker.name : countryName}
        isVisible={selectedMarker !== null}
        onClose={hideInfoCard}
        theme={theme}
        animationValue={animationValue}
        windowWidth={windowWidth}
        insetLeft={insets.left}
        insetRight={insets.right}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
    borderBottomWidth: 1,
  },
  topBarButton: {
    padding: 4,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: commonTokens.typography.displayMd.fontFamily,
    marginLeft: 12,
  },
  topBarSpacer: {
    width: 32,
  },
  fabContainer: {
    position: "absolute",
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
  },
  mapPin: {
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    zIndex: 20,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoCardClose: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  infoCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoCardFlag: {
    width: 56,
    height: 38,
    borderRadius: 6,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardName: {
    fontSize: 18,
    fontFamily: commonTokens.typography.displayMd.fontFamily,
    marginBottom: 4,
  },
  infoCardMeta: {
    fontSize: 13,
    fontFamily: commonTokens.typography.bodyMd.fontFamily,
    opacity: 0.7,
  },
});

export default MapScreen;
