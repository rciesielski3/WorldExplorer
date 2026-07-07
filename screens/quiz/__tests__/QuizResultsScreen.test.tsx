import React from "react";
import { render, act } from "@testing-library/react-native";
import { QuizResultsScreen } from "../QuizResultsScreen";
import { ThemeProvider } from "../../../context/ThemeContext";
import { QuizHistoryProvider } from "../../../context/QuizHistoryContext";
import { logger } from "../../../utils/logger";
// Side effect: initializes the shared i18next instance so `useTranslation()`
// inside QuizResultsScreen resolves real strings, matching App.tsx.
import "../../../i18n";

// lottie-react-native renders a native animation view; nothing in this repo
// mocks it yet since no test has rendered QuizResultsScreen before.
jest.mock("lottie-react-native", () => {
  const React = require("react");
  return React.forwardRef((_props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({ play: jest.fn() }));
    return null;
  });
});

// The global react-native-reanimated mock (jest.setup.js) only covers what
// other already-tested screens use (ZoomIn, useSharedValue, withSpring, a
// bare `View`). QuizResultsScreen additionally uses the default `Animated`
// export's `createAnimatedComponent`, `FadeInUp`, and `withDelay`, none of
// which the shared mock provides, so it's extended locally here.
jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  const chainable = () => ({ delay: () => chainable(), springify: () => chainable() });
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (Component: any) => Component,
      View: RN.View,
    },
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: jest.fn((value: any) => ({ value })),
    withSpring: jest.fn((value: any) => value),
    withTiming: jest.fn((value: any) => value),
    withDelay: jest.fn((_delay: number, value: any) => value),
    View: RN.View,
    ZoomIn: chainable(),
    FadeInUp: chainable(),
  };
});

let mockRouteParams: any = {};
const mockReplace = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useRoute: () => ({ params: mockRouteParams }),
  useNavigation: () => ({ replace: mockReplace }),
  StackActions: {},
}));

const renderQuizResultsScreen = () =>
  render(
    <ThemeProvider>
      <QuizHistoryProvider>
        <QuizResultsScreen />
      </QuizHistoryProvider>
    </ThemeProvider>
  );

describe("QuizResultsScreen", () => {
  let addQuizSessionSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReplace.mockClear();
    addQuizSessionSpy = jest.spyOn(
      require("../../../context/QuizHistoryContext"),
      "useQuizHistory"
    );
  });

  afterEach(() => {
    addQuizSessionSpy.mockRestore();
  });

  it("auto-saves the quiz session with the difficulty and timeTaken from route params", async () => {
    mockRouteParams = {
      score: 7,
      questions: [
        { question: "Q1", answer: "A", selectedAnswer: "A" },
        { question: "Q2", answer: "B", selectedAnswer: "C" },
      ],
      difficulty: "hard",
      timeTaken: 42,
    };

    const addQuizSession = jest.fn().mockResolvedValue(undefined);
    addQuizSessionSpy.mockReturnValue({ addQuizSession });

    renderQuizResultsScreen();

    await act(async () => {});

    expect(addQuizSession).toHaveBeenCalledWith(
      expect.objectContaining({
        difficulty: "hard",
        score: 7,
        timeTaken: 42,
        timestamp: expect.any(Number),
      })
    );
  });

  it("defaults to medium difficulty, 0 score, and 0 timeTaken when route params omit them", async () => {
    mockRouteParams = {
      score: 0,
      questions: [],
    };

    const addQuizSession = jest.fn().mockResolvedValue(undefined);
    addQuizSessionSpy.mockReturnValue({ addQuizSession });

    renderQuizResultsScreen();

    await act(async () => {});

    expect(addQuizSession).toHaveBeenCalledWith(
      expect.objectContaining({
        difficulty: "medium",
        score: 0,
        timeTaken: 0,
      })
    );
  });

  it("logs an error via the shared logger when saving the quiz session fails", async () => {
    mockRouteParams = {
      score: 3,
      questions: [{ question: "Q1", answer: "A", selectedAnswer: "A" }],
      difficulty: "easy",
      timeTaken: 10,
    };

    const failure = new Error("AsyncStorage write failed");
    const addQuizSession = jest.fn().mockRejectedValue(failure);
    addQuizSessionSpy.mockReturnValue({ addQuizSession });

    const loggerErrorSpy = jest.spyOn(logger, "error").mockImplementation(() => {});

    renderQuizResultsScreen();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      "Failed to save quiz session",
      expect.objectContaining({
        context: "QuizResultsScreen",
        metadata: expect.objectContaining({ error: expect.stringContaining("AsyncStorage write failed") }),
      })
    );

    loggerErrorSpy.mockRestore();
  });
});
