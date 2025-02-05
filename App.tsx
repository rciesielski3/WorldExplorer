import React from "react";
import Toast from "react-native-toast-message";
import {
  useFonts,
  Exo2_400Regular,
  Exo2_700Bold,
} from "@expo-google-fonts/exo-2";
import { ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { ThemeProvider } from "./context/ThemeContext";
import HomeScreen from "./screens/HomeScreen";
import ExploreScreen from "./screens/ExploreScreen";
import MapScreen from "./screens/MapScreen";
import QuizScreen from "./screens/quiz/QuizScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CountryDetailsScreen from "./screens/CountryDetailsScreen";
import QuizResultsScreen from "./screens/quiz/QuizResultsScreen";
import "./i18n";

const Stack = createStackNavigator();

export default function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const [fontsLoaded] = useFonts({
    "Exo2-Regular": Exo2_400Regular,
    "Exo2-Bold": Exo2_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <ActivityIndicator
        size="large"
        color="#6366F1"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <ThemeProvider isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "World Explorer" }}
          />
          <Stack.Screen name="Explore" component={ExploreScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen
            name="QuizResults"
            component={QuizResultsScreen}
            options={{ title: "Your Score" }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen
            name="CountryDetails"
            component={CountryDetailsScreen}
          />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </ThemeProvider>
  );
}
