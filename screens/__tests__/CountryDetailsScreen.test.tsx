import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import CountryDetailsScreen from "../CountryDetailsScreen";
import { ThemeProvider } from "../../context/ThemeContext";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { countries } from "../../utils/countries";
// Side effect: initializes the shared i18next instance (resources + default
// "en" language) so `useTranslation()` inside the screen resolves real
// strings instead of returning undefined, matching how App.tsx bootstraps it.
import "../../i18n";

jest.mock("../../utils/historicalFacts", () => ({
  fetchHistoricalFacts: jest.fn(() =>
    Promise.resolve(["Fact one", "Fact two"])
  ),
}));

// react-native-maps ships an untranspiled JSX build under Jest's CJS
// runtime (unrelated to this task — the screen only mounts <MapView> when
// the "map" tab is active, but the module is imported unconditionally at
// the top of the file). Stub it with plain View-based components so the
// module resolves without needing native code or a JSX build.
jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: View,
    Marker: View,
  };
});

// AdBanner pulls in react-native-google-mobile-ads, which requires a native
// TurboModule that doesn't exist under Jest. Stub it out — ad rendering is
// unrelated to this screen's favorites/facts behavior under test.
jest.mock("../../src/components/AdBanner", () => "AdBanner");

const mockCountry = countries[0];

const renderScreen = () =>
  render(
    <NavigationContainer>
      <ThemeProvider>
        <FavoritesProvider>
          <CountryDetailsScreen
            route={{ params: { country: mockCountry } } as any}
            navigation={{ setOptions: jest.fn(), navigate: jest.fn(), goBack: jest.fn() } as any}
          />
        </FavoritesProvider>
      </ThemeProvider>
    </NavigationContainer>
  );

describe("CountryDetailsScreen", () => {
  it("should toggle the favorite button when pressed", async () => {
    const { getByTestId } = renderScreen();

    // ThemeProvider reads the persisted preference from AsyncStorage on
    // mount and shows a splash screen until that promise settles.
    await act(async () => {});

    const favoriteBtn = getByTestId("favorite-btn");
    expect(favoriteBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(favoriteBtn);
    });

    expect(favoriteBtn.props.accessibilityLabel).toBe("Remove from favorites");
  });

  it("should show historical facts on the Facts tab", async () => {
    const { getByText } = renderScreen();

    await act(async () => {});

    fireEvent.press(getByText("Facts"));

    await act(async () => {});

    expect(getByText("Fact one")).toBeTruthy();
    expect(getByText("Fact two")).toBeTruthy();
  });

  it("should display the testKnowledge translation key", async () => {
    const { getByText } = renderScreen();

    await act(async () => {});

    expect(getByText("Test Your Knowledge")).toBeTruthy();
  });
});
