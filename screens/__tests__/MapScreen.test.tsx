import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MapScreen from "../MapScreen";
import { ThemeProvider } from "../../context/ThemeContext";
import { commonTokens } from "../../theme/tokens";
import "../../i18n";

jest.mock("react-native-maps", () => {
  const { View, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: View,
    Marker: ({ onPress, children }: { onPress?: () => void; children?: React.ReactNode }) => (
      <Pressable testID="map-marker" onPress={onPress}>
        {children}
      </Pressable>
    ),
    Callout: View,
  };
});

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

const setWindow = (width: number, height: number) =>
  mockUseWindowDimensions.mockReturnValue({
    width,
    height,
    scale: 2,
    fontScale: 1,
  });

const NO_INSETS = { top: 0, left: 0, right: 0, bottom: 0 };

const makeElement = (insets = NO_INSETS) => (
  <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 400, height: 800 }, insets }}>
    <ThemeProvider>
      <MapScreen
        navigation={{ goBack: jest.fn() } as never}
        route={
          {
            key: "map",
            name: "Map",
            params: {
              latitude: 10,
              longitude: 20,
              countryName: "Testland",
              country: { name: "Testland", capital: "Testville", lat: 10, lng: 20 },
            },
          } as never
        }
      />
    </ThemeProvider>
  </SafeAreaProvider>
);

describe("MapScreen responsive layout", () => {
  it("recomputes layout when window dimensions change", async () => {
    setWindow(400, 800);
    const { findByTestId, rerender } = render(makeElement());

    const portraitFab = StyleSheet.flatten((await findByTestId("map-fab-container")).props.style);
    expect(portraitFab.bottom).toBe(100);

    setWindow(800, 400);
    rerender(makeElement());

    const landscapeFab = StyleSheet.flatten((await findByTestId("map-fab-container")).props.style);
    expect(landscapeFab.bottom).toBe(commonTokens.spacing.lg);
  });

  it("centers and caps the info card on wide screens", async () => {
    setWindow(1000, 600);
    const { findByTestId } = render(makeElement());

    fireEvent.press(await findByTestId("map-marker"));
    await act(async () => {});

    const card = StyleSheet.flatten((await findByTestId("map-info-card")).props.style);
    const max = commonTokens.layout.maxContentWidth;
    expect(card.width).toBe(max);
    expect(card.left).toBe((1000 - max) / 2);
  });

  it("lets the info card fill narrow screens", async () => {
    setWindow(400, 800);
    const { findByTestId } = render(makeElement());

    fireEvent.press(await findByTestId("map-marker"));
    await act(async () => {});

    const card = StyleSheet.flatten((await findByTestId("map-info-card")).props.style);
    expect(card.width).toBe(400);
    expect(card.left).toBe(0);
  });

  it("keeps the info card and FAB clear of horizontal insets in landscape", async () => {
    setWindow(800, 400);
    const { findByTestId } = render(makeElement({ top: 0, left: 48, right: 32, bottom: 0 }));

    fireEvent.press(await findByTestId("map-marker"));
    await act(async () => {});

    const card = StyleSheet.flatten((await findByTestId("map-info-card")).props.style);
    // Available width 800 - 48 - 32 = 720, exactly the cap, so it sits at the left inset.
    expect(card.width).toBe(720);
    expect(card.left).toBe(48);

    const fab = StyleSheet.flatten((await findByTestId("map-fab-container")).props.style);
    expect(fab.right).toBe(commonTokens.spacing.md + 32);
  });
});
