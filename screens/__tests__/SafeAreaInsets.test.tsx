import React from "react";
import { StyleSheet } from "react-native";
import { render, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "../../context/ThemeContext";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { QuizHistoryProvider } from "../../context/QuizHistoryContext";
import { QuizStatsScreen } from "../QuizStatsScreen";
import { ComparisonScreen } from "../ComparisonScreen";
import { FavoritesScreen } from "../FavoritesScreen";
import { QuizResultsScreen } from "../quiz/QuizResultsScreen";
import HomeScreen from "../HomeScreen";
import ExploreScreen from "../ExploreScreen";
import CountryDetailsScreen from "../CountryDetailsScreen";
import { countries } from "../../utils/countries";
import { WithSafeArea, TEST_SAFE_AREA_METRICS } from "../../tests/safeAreaTestUtils";
// Side effect: initializes the shared i18next instance, matching App.tsx.
import "../../i18n";

jest.mock("lottie-react-native", () => {
  const React = require("react");
  return React.forwardRef((_props: unknown, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({ play: jest.fn() }));
    return null;
  });
});

// QuizResultsScreen uses reanimated APIs the shared mock does not cover.
jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  const chainable = () => ({ delay: () => chainable(), springify: () => chainable() });
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (Component: unknown) => Component,
      View: RN.View,
    },
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: jest.fn((value: unknown) => ({ value })),
    withSpring: jest.fn((value: unknown) => value),
    withTiming: jest.fn((value: unknown) => value),
    withDelay: jest.fn((_delay: number, value: unknown) => value),
    View: RN.View,
    ZoomIn: chainable(),
    FadeInUp: chainable(),
  };
});

jest.mock("../../src/components/AdBanner", () => "AdBanner");
jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return { __esModule: true, default: View, Marker: View };
});
jest.mock("../../utils/historicalFacts", () => ({
  fetchHistoricalFacts: jest.fn(() => Promise.resolve([])),
}));

// Stable references: QuizResultsScreen runs an effect keyed on these, so fresh
// objects per render would loop forever.
const mockRoute = { params: { score: 3, questions: [], difficulty: "easy", timeTaken: 10 } };
const mockNavigation = { replace: jest.fn(), navigate: jest.fn() };

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useRoute: () => mockRoute,
    useNavigation: () => mockNavigation,
  };
});

// The native view backing react-native-safe-area-context's SafeAreaView.
const NATIVE_SAFE_AREA_VIEW = "RNCSafeAreaView";
const { top, bottom } = TEST_SAFE_AREA_METRICS.insets;

const renderWithInsets = (ui: React.ReactElement) =>
  render(
    <WithSafeArea>
      <NavigationContainer>
        <ThemeProvider>
          <FavoritesProvider>
            <QuizHistoryProvider>{ui}</QuizHistoryProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </NavigationContainer>
    </WithSafeArea>,
  );

const safeAreaScreens: Array<[string, () => React.ReactElement]> = [
  ["QuizStatsScreen", () => <QuizStatsScreen navigation={{ navigate: jest.fn() }} />],
  [
    "ComparisonScreen",
    () => (
      <ComparisonScreen
        route={{ params: {} } as never}
        navigation={{ setOptions: jest.fn() } as never}
      />
    ),
  ],
  [
    "FavoritesScreen",
    () => <FavoritesScreen route={{} as never} navigation={{ navigate: jest.fn() } as never} />,
  ],
  ["QuizResultsScreen", () => <QuizResultsScreen />],
];

const insetPaddingScreens: Array<[string, () => React.ReactElement]> = [
  [
    "HomeScreen",
    () => <HomeScreen navigation={{ navigate: jest.fn() } as never} route={{} as never} />,
  ],
  [
    "ExploreScreen",
    () => (
      <ExploreScreen
        navigation={{ navigate: jest.fn() } as never}
        route={{ key: "Explore", name: "Explore" } as never}
      />
    ),
  ],
  [
    "CountryDetailsScreen",
    () => (
      <CountryDetailsScreen
        route={{ params: { country: countries[0] } } as never}
        navigation={{ setOptions: jest.fn(), navigate: jest.fn(), goBack: jest.fn() } as never}
      />
    ),
  ],
];

type FlatStyle = { paddingTop?: number; paddingBottom?: number };

const collectStyles = (tree: unknown): FlatStyle[] => {
  const found: FlatStyle[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const n = node as { props?: { style?: unknown }; children?: unknown[] };
    if (n.props?.style) {
      found.push((StyleSheet.flatten(n.props.style as never) ?? {}) as FlatStyle);
    }
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(tree) ? tree : [tree]).forEach(walk);
  return found;
};

describe("edge-to-edge safe area handling", () => {
  it.each(safeAreaScreens)(
    "%s is wrapped in a SafeAreaView that applies top and bottom insets",
    async (_name, build) => {
      const { UNSAFE_getAllByType } = renderWithInsets(build());
      await act(async () => {});

      const views = UNSAFE_getAllByType(NATIVE_SAFE_AREA_VIEW as never);
      expect(views.length).toBeGreaterThan(0);
      // Native edge modes: "off" would mean that inset is ignored.
      const edges = views[0].props.edges as Record<string, string>;
      expect(edges.top).not.toBe("off");
      expect(edges.bottom).not.toBe("off");
    },
  );

  it.each(insetPaddingScreens)(
    "%s pads its root view by the top and bottom insets",
    async (_name, build) => {
      const { toJSON } = renderWithInsets(build());
      await act(async () => {});

      const styles = collectStyles(toJSON());
      expect(styles.some((s) => s.paddingTop === top && s.paddingBottom === bottom)).toBe(true);
    },
  );
});
