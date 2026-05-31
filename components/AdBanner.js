import React from "react";
import { View, StyleSheet } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { ADMOB_BANNER_ID } from "@env";

import { usePremium } from "../context/PremiumContext";

const adUnitId = ADMOB_BANNER_ID || TestIds.BANNER;

const AdBanner = () => {
  const { isPremium } = usePremium();

  if (isPremium) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "rgba(189, 189, 189, 0.43)",
    minHeight: 64,
    justifyContent: "center",
    paddingVertical: 4,
  },
});

export default AdBanner;
