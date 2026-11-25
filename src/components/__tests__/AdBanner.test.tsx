import React from "react";
import { render } from "@testing-library/react-native";
import AdBanner from "../AdBanner";

const mockUsePremium = jest.fn();

jest.mock("../../../context/PremiumContext", () => ({
  usePremium: () => mockUsePremium(),
}));

// react-native-google-mobile-ads needs native modules unavailable under Jest.
jest.mock("react-native-google-mobile-ads", () => {
  const ReactActual = jest.requireActual<typeof import("react")>("react");
  return {
    BannerAd: (props: object) =>
      ReactActual.createElement("BannerAd", { testID: "banner-ad", ...props }),
    BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: "ANCHORED_ADAPTIVE_BANNER" },
    TestIds: { BANNER: "test-banner-id" },
  };
});

jest.mock("@env", () => ({ ADMOB_BANNER_ID: undefined }), { virtual: true });

describe("AdBanner", () => {
  it("renders the banner for a non-premium user", () => {
    mockUsePremium.mockReturnValue({ isPremium: false, isLoading: false });
    const { queryByTestId } = render(<AdBanner />);
    expect(queryByTestId("banner-ad")).toBeTruthy();
  });

  it("renders nothing for a premium user", () => {
    mockUsePremium.mockReturnValue({ isPremium: true, isLoading: false });
    const { toJSON, queryByTestId } = render(<AdBanner />);
    expect(queryByTestId("banner-ad")).toBeNull();
    expect(toJSON()).toBeNull();
  });

  it("renders nothing while premium state is loading", () => {
    mockUsePremium.mockReturnValue({ isPremium: false, isLoading: true });
    const { toJSON, queryByTestId } = render(<AdBanner />);
    expect(queryByTestId("banner-ad")).toBeNull();
    expect(toJSON()).toBeNull();
  });
});
