import React from "react";
import { Text, StyleSheet, useWindowDimensions } from "react-native";
import type { ViewStyle } from "react-native";
import { render } from "@testing-library/react-native";
import { ContentContainer } from "../ContentContainer";
import { commonTokens } from "../../../theme/tokens";

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;
const max = commonTokens.layout.maxContentWidth;

const setWidth = (width: number) =>
  mockUseWindowDimensions.mockReturnValue({
    width,
    height: 800,
    scale: 2,
    fontScale: 1,
  });

const ui = () => (
  <ContentContainer>
    <Text>content</Text>
  </ContentContainer>
);

const flatStyle = (getByTestId: (id: string) => { props: { style?: unknown } }): ViewStyle =>
  StyleSheet.flatten(getByTestId("content-container").props.style as ViewStyle);

describe("ContentContainer", () => {
  it("caps and centers content above the token threshold", () => {
    setWidth(max + 300);
    const { getByTestId } = render(ui());
    const style = flatStyle(getByTestId);
    expect(style.maxWidth).toBe(max);
    expect(style.alignSelf).toBe("center");
  });

  it("does not constrain content at or below the threshold", () => {
    setWidth(max);
    const { getByTestId, rerender } = render(ui());
    expect(flatStyle(getByTestId).maxWidth).toBeUndefined();

    setWidth(400);
    rerender(ui());
    expect(flatStyle(getByTestId).maxWidth).toBeUndefined();
  });

  it("re-evaluates when the window width changes", () => {
    setWidth(400);
    const { getByTestId, rerender } = render(ui());
    setWidth(1200);
    rerender(ui());
    expect(flatStyle(getByTestId).maxWidth).toBe(max);
  });
});
