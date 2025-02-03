import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import ExploreScreen from "./screens/ExploreScreen";
import MapScreen from "./screens/MapScreen";
import QuizScreen from "./screens/QuizScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CountryDetailsScreen from "./screens/CountryDetailsScreen";
import { ThemeProvider } from "./context/ThemeContext";
import "./i18n";

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
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
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen
            name="CountryDetails"
            component={CountryDetailsScreen}
            options={{ title: "Country Details" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
