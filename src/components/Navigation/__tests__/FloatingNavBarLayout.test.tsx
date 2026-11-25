import React from "react";
import { render } from "@testing-library/react-native";
import { StyleSheet, useWindowDimensions } from "react-native";
import type { ViewStyle } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FloatingNavBar } from "../FloatingNavBar";
import { ThemeProvider } from "../../../../context/ThemeContext";
import { commonTokens } from "../../../../theme/tokens";

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

const setWidth = (width: number) =>
  mockUseWindowDimensions.mockReturnValue({ width, height: 800, scale: 2, fontScale: 1 });

const items = [{ name: "home", icon: "home", color: "#1E88E5" }];

const renderBar = (insets = { top: 0, left: 0, right: 0, bottom: 0 }) =>
  render(
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 400, height: 800 }, insets }}>
      <ThemeProvider>
        <FloatingNavBar currentRoute="home" onNavigate={jest.fn()} items={items} testID="nav" />
      </ThemeProvider>
    </SafeAreaProvider>,
  );

const barStyle = async (r: ReturnType<typeof renderBar>): Promise<ViewStyle> =>
  StyleSheet.flatten((await r.findByTestId("nav")).props.style as ViewStyle);

describe("FloatingNavBar layout", () => {
  it("keeps the original 24dp side offsets on narrow screens", async () => {
    setWidth(400);
    const style = await barStyle(renderBar());
    expect(commonTokens.spacing.lg).toBe(24);
    expect(commonTokens.spacing.md).toBe(16);
    expect(style.left).toBe(24);
    expect(style.right).toBe(24);
  });

  it("caps to the content width and stays centered on wide screens", async () => {
    setWidth(800);
    const style = await barStyle(renderBar());
    const max = commonTokens.layout.maxContentWidth;
    const left = style.left as number;
    const right = style.right as number;
    expect(800 - left - right).toBe(max);
    expect(left).toBe(right);
  });

  it("clears horizontal safe-area insets in landscape", async () => {
    setWidth(400);
    const style = await barStyle(renderBar({ top: 0, left: 40, right: 20, bottom: 0 }));
    expect(style.left).toBe(24 + 40);
    expect(style.right).toBe(24 + 20);
  });
});
