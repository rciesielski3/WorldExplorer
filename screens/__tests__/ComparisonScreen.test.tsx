import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ComparisonScreen } from "../ComparisonScreen";
import { ThemeProvider } from "../../context/ThemeContext";
// Side effect: initializes the shared i18next instance (resources + default
// "en" language) so `useTranslation()` inside ComparisonScreen resolves real
// strings instead of returning undefined, matching how App.tsx bootstraps it.
import "../../i18n";

describe("ComparisonScreen", () => {
  it("should allow selecting countries", async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <ThemeProvider>
          <ComparisonScreen
            route={{ params: {} } as any}
            navigation={{ setOptions: jest.fn() } as any}
          />
        </ThemeProvider>
      </NavigationContainer>
    );

    // ThemeProvider reads the persisted preference from AsyncStorage on
    // mount and shows a splash screen until that promise settles.
    await act(async () => {});

    fireEvent.press(getByTestId("add-country-btn"));

    expect(getByTestId("picker-search")).toBeTruthy();
  });

  it("should show comparison table when 2+ countries selected", async () => {
    const mockCountries = [
      { code: "US", translations: { en: { name: "United States" } } },
      { code: "FR", translations: { en: { name: "France" } } },
    ] as any;

    const { getByText } = render(
      <NavigationContainer>
        <ThemeProvider>
          <ComparisonScreen
            route={{ params: { initialCountries: mockCountries } } as any}
            navigation={{ setOptions: jest.fn() } as any}
          />
        </ThemeProvider>
      </NavigationContainer>
    );

    await act(async () => {});

    expect(getByText("Capital")).toBeTruthy();
  });
});
