require("dotenv").config();

const admobAndroidAppId =
  process.env.ADMOB_APP_ID ||
  process.env.ADMOB_UNIT_ID ||
  "ca-app-pub-4185040274135926~2042240790";
const admobIosAppId =
  process.env.ADMOB_IOS_APP_ID || "ca-app-pub-3940256099942544~1458002511";

module.exports = {
  expo: {
    name: "WorldExplorer",
    slug: "WorldExplorer",
    sdkVersion: "53.0.0",
    platforms: ["android"],
    version: "2.0.2",
    orientation: "portrait",
    icon: "./assets/world.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./assets/world.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    android: {
      package: "com.adateo.WorldExplorer",
      versionCode: 142,
      permissions: [
        "com.google.android.gms.permission.AD_ID",
        "com.android.vending.BILLING",
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.adateo.WorldExplorer",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-font",
      "expo-asset",
      "@react-native-vector-icons/material-community-icons",
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: admobAndroidAppId,
          iosAppId: admobIosAppId,
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "b2f8d32c-e15b-4b06-a2e2-f19c508b1987",
      },
      ADMOB_APP_ID: admobAndroidAppId,
      ADMOB_BANNER_ID: process.env.ADMOB_BANNER_ID,
      ADMOB_INTERSTITIAL_ID: process.env.ADMOB_INTERSTITIAL_ID,
      EXPO_PUBLIC_PREMIUM_ENABLED: process.env.EXPO_PUBLIC_PREMIUM_ENABLED,
      EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY:
        process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
      EXPO_PUBLIC_REVENUECAT_IOS_API_KEY:
        process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
      EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID:
        process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID,
      EXPO_PUBLIC_REVENUECAT_PREMIUM_PRODUCT_ID:
        process.env.EXPO_PUBLIC_REVENUECAT_PREMIUM_PRODUCT_ID ||
        "worldexplorer_premium_lifetime",
    },
    assetBundlePatterns: ["**/*"],
  },
};
