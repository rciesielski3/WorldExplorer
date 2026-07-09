import React, { Suspense } from "react";
import Toast from "react-native-toast-message";
import {
  useFonts,
  Exo2_400Regular,
  Exo2_700Bold,
} from "@expo-google-fonts/exo-2";
import { ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import mobileAds from "react-native-google-mobile-ads";
import * as Font from "expo-font";
import "./i18n";
import { logger } from "./utils/logger";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
import { PremiumProvider } from "./context/PremiumContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { QuizHistoryProvider } from "./context/QuizHistoryContext";
import HomeScreen from "./screens/HomeScreen";
import ExploreScreen from "./screens/ExploreScreen";
import MapScreen from "./screens/MapScreen";
import QuizScreen from "./screens/quiz/QuizScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CountryDetailsScreen from "./screens/CountryDetailsScreen";
import QuizResultsScreen from "./screens/quiz/QuizResultsScreen";
import { ComparisonScreen } from "./screens/ComparisonScreen";
import { FavoritesScreen } from "./screens/FavoritesScreen";
import type { RootStackParamList } from "./types/navigation";

const LazyQuizStatsScreen = React.lazy(() =>
  import("./screens/QuizStatsScreen").then((m) => ({ default: m.QuizStatsScreen }))
);

// React Navigation only accepts `Stack.Screen`/`Stack.Group` as direct
// children of a navigator, so the lazy screen must be wrapped in its own
// component rather than having `<Suspense>` sit between `Stack.Navigator`
// and `Stack.Screen`.
function QuizStatsScreenWrapper(props: React.ComponentProps<typeof LazyQuizStatsScreen>) {
  return (
    <Suspense fallback={<ActivityIndicator size="large" color="#6366F1" />}>
      <LazyQuizStatsScreen {...props} />
    </Suspense>
  );
}

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const { t } = useTranslation();

  const [fontsLoaded, fontError] = useFonts({
    "Exo2-Regular": Exo2_400Regular,
    "Exo2-Bold": Exo2_700Bold,
  });

  React.useEffect(() => {
    if (fontError) {
      logger.warn("Fonts failed to load", {
        context: "App",
        timestamp: new Date().toISOString(),
        metadata: { error: fontError?.message },
      });
    }
  }, [fontError]);

  React.useEffect(() => {
    mobileAds()
      .initialize()
      .catch((error) => {
        logger.warn("AdMob initialization failed", {
          context: "App",
          timestamp: new Date().toISOString(),
          metadata: { error: error?.message },
        });
        // App continues without ads if initialization fails
      });
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <ActivityIndicator
        size="large"
        color="#6366F1"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <ErrorBoundary>
      <PremiumProvider>
        <ThemeProvider>
          <FavoritesProvider>
            <QuizHistoryProvider>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Home"
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: "World Explorer" }}
                  />
                  <Stack.Screen
                    name="Explore"
                    component={ExploreScreen}
                    options={{ title: t("explore") }}
                  />
                  <Stack.Screen
                    name="Map"
                    component={MapScreen}
                    options={{ title: t("map") }}
                  />
                  <Stack.Screen
                    name="Quiz"
                    component={QuizScreen}
                    options={{ title: t("quiz") }}
                  />
                  <Stack.Screen
                    name="QuizResults"
                    component={QuizResultsScreen}
                    options={{ title: t("yourScore") }}
                  />
                  <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ title: t("settings") }}
                  />
                  <Stack.Screen
                    name="CountryDetails"
                    component={CountryDetailsScreen}
                    options={{ title: t("countryDetails") }}
                  />
                  <Stack.Screen
                    name="Comparison"
                    component={ComparisonScreen}
                    options={{ title: t("compareCountries") }}
                  />
                  <Stack.Screen
                    name="Favorites"
                    component={FavoritesScreen}
                    options={{ title: t("favorites") }}
                  />
                  <Stack.Screen
                    name="QuizStats"
                    component={QuizStatsScreenWrapper}
                    options={{ title: t("quizStatistics") }}
                  />
                </Stack.Navigator>
                <Toast />
              </NavigationContainer>
            </QuizHistoryProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </PremiumProvider>
    </ErrorBoundary>
  );
}
