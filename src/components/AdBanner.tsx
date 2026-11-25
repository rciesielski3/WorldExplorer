import React, { useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { ADMOB_BANNER_ID } from "@env";

const adUnitId = ADMOB_BANNER_ID || TestIds.BANNER;

const AdBanner = () => {
  const { width: windowWidth } = useWindowDimensions();
  // Track the real container width so the adaptive banner is re-requested at
  // the correct width after rotation or inside a width-capped container.
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);
  const availableWidth = Math.round(layoutWidth ?? windowWidth);

  const handleLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.width;
    if (next > 0) setLayoutWidth(next);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <BannerAd
        key={availableWidth}
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
