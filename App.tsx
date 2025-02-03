import React from "react";
import { ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import * as Font from "expo-font";

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
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Exo2-Regular": require("./assets/fonts/Exo2-Regular.ttf"),
        "Exo2-Bold": require("./assets/fonts/Exo2-Bold.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#6366F1" />;
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
