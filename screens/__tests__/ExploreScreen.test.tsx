import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import ExploreScreen from "../ExploreScreen";
import { ThemeProvider } from "../../context/ThemeContext";
// Side effect: initializes the shared i18next instance (resources + default
// "en" language) so `useTranslation()` inside ExploreScreen resolves real
// strings instead of returning undefined, matching how App.tsx bootstraps it.
import "../../i18n";

// AdBanner renders a native react-native-google-mobile-ads component that
// isn't mocked anywhere in this repo (no screen test has rendered it yet).
// Stub it out here since ad delivery isn't what this test exercises.
jest.mock("../../src/components/AdBanner", () => "AdBanner");

const navigate = jest.fn();

const renderExploreScreen = () =>
  render(
    <NavigationContainer>
      <ThemeProvider>
        <ExploreScreen
          navigation={{ navigate } as any}
          route={{ key: "Explore", name: "Explore" } as any}
        />
      </ThemeProvider>
    </NavigationContainer>
  );

describe("ExploreScreen", () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  it("filters the country list by name or capital as the user types", async () => {
    const { getByTestId, queryByText } = renderExploreScreen();

    // ThemeProvider reads the persisted preference from AsyncStorage on
    // mount and shows a splash screen until that promise settles; fetching
    // countries also resolves asynchronously.
    await act(async () => {});

    const input = getByTestId("search-input");
    fireEvent.changeText(input, "Andorra");

    await waitFor(() => {
      expect(queryByText("Andorra")).toBeTruthy();
    });

    fireEvent.changeText(input, "Vella"); // Andorra's capital: Andorra la Vella

    await waitFor(() => {
      expect(queryByText("Andorra")).toBeTruthy();
    });

    fireEvent.changeText(input, "zzzznonexistentcountryzzzz");

    await waitFor(() => {
      expect(queryByText("Andorra")).toBeNull();
    });
  });

  it("navigates to Comparison with the selected country when the compare button is pressed", async () => {
    const { getByTestId } = renderExploreScreen();

    await act(async () => {});

    fireEvent.press(getByTestId("compare-AD"));

    expect(navigate).toHaveBeenCalledWith(
      "Comparison",
      expect.objectContaining({
        initialCountries: expect.arrayContaining([
          expect.objectContaining({ code: "AD" }),
        ]),
      })
    );
  });
});
