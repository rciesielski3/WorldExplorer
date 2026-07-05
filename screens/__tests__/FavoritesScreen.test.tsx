import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FavoritesScreen } from "../FavoritesScreen";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { ThemeProvider } from "../../context/ThemeContext";
// Side effect: initializes the shared i18next instance (resources + default
// "en" language) so `useTranslation()` inside FavoritesScreen resolves real
// strings instead of returning undefined, matching how App.tsx bootstraps it.
import "../../i18n";

const FAVORITES_STORAGE_KEY = "worldexplorer_favorites";

const renderFavoritesScreen = () =>
  render(
    <NavigationContainer>
      <ThemeProvider>
        <FavoritesProvider>
          <FavoritesScreen
            navigation={{ navigate: jest.fn() } as any}
            route={{} as any}
          />
        </FavoritesProvider>
      </ThemeProvider>
    </NavigationContainer>
  );

describe("FavoritesScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("should show empty state when no favorites are stored", async () => {
    const { getByText, queryByTestId } = renderFavoritesScreen();

    // ThemeProvider and FavoritesProvider both read persisted state from
    // AsyncStorage on mount; flush those promises before asserting.
    await act(async () => {});

    expect(getByText("No favorites yet")).toBeTruthy();
    // The search bar only renders once there is at least one favorite.
    expect(queryByTestId("search-input")).toBeNull();
  });

  it("should filter favorited countries by search query", async () => {
    await AsyncStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(["US", "FR"])
    );

    const { getByTestId, queryByTestId } = renderFavoritesScreen();

    await act(async () => {});

    expect(getByTestId("favorite-card-US")).toBeTruthy();
    expect(getByTestId("favorite-card-FR")).toBeTruthy();

    fireEvent.changeText(getByTestId("search-input"), "France");

    expect(queryByTestId("favorite-card-US")).toBeNull();
    expect(getByTestId("favorite-card-FR")).toBeTruthy();
  });
});
