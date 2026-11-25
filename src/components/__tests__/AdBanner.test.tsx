import { render } from "@testing-library/react-native";
import { useWindowDimensions } from "react-native";
import AdBanner, { getAdWidthBucket } from "../AdBanner";
import { commonTokens } from "../../../theme/tokens";

const mockMount = jest.fn();
const mockUsePremium = jest.fn();

jest.mock("../../../context/PremiumContext", () => ({
  usePremium: () => mockUsePremium(),
}));

jest.mock("react-native-google-mobile-ads", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { View } = jest.requireActual<typeof import("react-native")>("react-native");
  const BannerAd = () => {
    React.useEffect(() => {
      mockMount();
    }, []);
    return <View testID="banner-ad" />;
  };
  return {
    BannerAd,
    BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: "ANCHORED_ADAPTIVE_BANNER" },
    TestIds: { BANNER: "test-banner" },
  };
});

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;
const setWidth = (width: number) =>
  mockUseWindowDimensions.mockReturnValue({ width, height: 800, scale: 2, fontScale: 1 });

describe("AdBanner", () => {
  beforeEach(() => {
    mockMount.mockClear();
    mockUsePremium.mockReturnValue({ isPremium: false, isLoading: false });
  });

  it("requests the ad once on mount", () => {
    setWidth(400);
    render(<AdBanner />);
    expect(mockMount).toHaveBeenCalledTimes(1);
  });

  it("does not remount when the width changes by a few px", () => {
    setWidth(400);
    const { rerender } = render(<AdBanner />);
    for (const w of [401, 403, 397, 410]) {
      setWidth(w);
      rerender(<AdBanner />);
    }
    expect(mockMount).toHaveBeenCalledTimes(1);
  });

  it("re-requests once on a real size change such as rotation", () => {
    setWidth(400);
    const { rerender } = render(<AdBanner />);
    setWidth(700);
    rerender(<AdBanner />);
    expect(mockMount).toHaveBeenCalledTimes(2);
  });

  it("caps the bucket at the content max width", () => {
    expect(getAdWidthBucket(2000)).toBe(getAdWidthBucket(commonTokens.layout.maxContentWidth));
  });

  it("renders the banner for a non-premium user", () => {
    setWidth(400);
    const { queryByTestId } = render(<AdBanner />);
    expect(queryByTestId("banner-ad")).toBeTruthy();
  });

  it("renders nothing for a premium user", () => {
    setWidth(400);
    mockUsePremium.mockReturnValue({ isPremium: true, isLoading: false });
    const { toJSON, queryByTestId } = render(<AdBanner />);
    expect(queryByTestId("banner-ad")).toBeNull();
    expect(toJSON()).toBeNull();
    expect(mockMount).not.toHaveBeenCalled();
  });

  it("renders nothing while premium state is loading", () => {
    setWidth(400);
    mockUsePremium.mockReturnValue({ isPremium: false, isLoading: true });
    const { toJSON, queryByTestId } = render(<AdBanner />);
    expect(queryByTestId("banner-ad")).toBeNull();
    expect(toJSON()).toBeNull();
    expect(mockMount).not.toHaveBeenCalled();
  });
});
