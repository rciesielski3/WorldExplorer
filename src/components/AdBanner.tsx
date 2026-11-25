import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { ADMOB_BANNER_ID } from "@env";
import { commonTokens } from "../../theme/tokens";

const adUnitId = ADMOB_BANNER_ID || TestIds.BANNER;

// Width changes smaller than this (dp) do not re-request the ad, so freeform
// window resizing cannot trigger a reload on every pixel.
export const AD_WIDTH_BUCKET = 100;

export const getAdWidthBucket = (windowWidth: number) => {
  const capped = Math.min(windowWidth, commonTokens.layout.maxContentWidth);
  return Math.max(AD_WIDTH_BUCKET, Math.round(capped / AD_WIDTH_BUCKET) * AD_WIDTH_BUCKET);
};

const AdBanner = () => {
  const { width } = useWindowDimensions();
  const widthBucket = getAdWidthBucket(width);

  return (
    <View style={styles.container}>
      <BannerAd
        key={widthBucket}
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
    width: "100%",
  },
});

export default AdBanner;
