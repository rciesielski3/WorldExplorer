import React from "react";
import { render, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../context/ThemeContext";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { QuizHistoryProvider } from "../../context/QuizHistoryContext";
import { QuizStatsScreen } from "../QuizStatsScreen";
import { ComparisonScreen } from "../ComparisonScreen";
import { FavoritesScreen } from "../FavoritesScreen";
import { QuizResultsScreen } from "../quiz/QuizResultsScreen";
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

const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

// The native view backing react-native-safe-area-context's SafeAreaView.
const NATIVE_SAFE_AREA_VIEW = "RNCSafeAreaView";

const renderWithInsets = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <NavigationContainer>
        <ThemeProvider>
          <FavoritesProvider>
            <QuizHistoryProvider>{ui}</QuizHistoryProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );

const screens: Array<[string, () => React.ReactElement]> = [
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

describe("edge-to-edge safe area wrapping", () => {
  it.each(screens)(
    "%s renders inside react-native-safe-area-context SafeAreaView",
    async (_name, build) => {
      const { UNSAFE_getAllByType } = renderWithInsets(build());
      await act(async () => {});

      expect(UNSAFE_getAllByType(NATIVE_SAFE_AREA_VIEW as never).length).toBeGreaterThan(0);
    }
  );
});
