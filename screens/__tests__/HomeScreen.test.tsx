import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import HomeScreen from "../HomeScreen";
import { ThemeProvider } from "../../context/ThemeContext";
import { useQuizHistory } from "../../context/QuizHistoryContext";
// Side effect: initializes the shared i18next instance (resources + default
// "en" language) so `useTranslation()` inside HomeScreen resolves real
// strings instead of returning undefined, matching how App.tsx bootstraps it.
import "../../i18n";

// lottie-react-native renders a native animation view; HomeScreen's hero
// section plays an explore.json animation via <LottieView>, which has no
// usable implementation under Jest.
jest.mock("lottie-react-native", () => {
  const React = require("react");
  return React.forwardRef((_props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({ play: jest.fn() }));
    return null;
  });
});

// HomeScreen reads streak/quiz stats via useQuizHistory(); mocking the
// module (rather than rendering a real QuizHistoryProvider) lets each test
// control the returned stats directly, matching the plan's test spec.
jest.mock("../../context/QuizHistoryContext", () => ({
  useQuizHistory: jest.fn(),
}));

const mockNavigate = jest.fn();

const defaultStats = {
  totalQuizzes: 0,
  currentStreak: 0,
  bestScore: 0,
  lastQuizDate: 0,
};

const renderHomeScreen = () =>
  render(
    <ThemeProvider>
      <HomeScreen
        navigation={{ navigate: mockNavigate } as any}
        route={{} as any}
      />
    </ThemeProvider>
  );

describe("HomeScreen", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    const mockUseQuizHistory = useQuizHistory as jest.Mock;
    mockUseQuizHistory.mockReturnValue({
      getStats: () => defaultStats,
      getSessions: () => [],
      addQuizSession: jest.fn(),
      clearHistory: jest.fn(),
      isLoading: false,
    });
  });

  it("renders without crashing and shows the welcome header", async () => {
    const { getAllByText } = renderHomeScreen();
    await act(async () => {});

    expect(getAllByText(/World Explorer/).length).toBeGreaterThan(0);
  });

  describe("HomeScreen - Streak and Daily Challenge", () => {
    it("renders StreakBadge if streak > 0", async () => {
      const mockUseQuizHistory = useQuizHistory as jest.Mock;
      mockUseQuizHistory.mockReturnValue({
        getStats: () => ({
          totalQuizzes: 10,
          currentStreak: 7,
          bestScore: 100,
          lastQuizDate: Date.now(),
        }),
        getSessions: () => [],
        addQuizSession: jest.fn(),
        clearHistory: jest.fn(),
        isLoading: false,
      });

      const { getByTestId } = renderHomeScreen();
      await act(async () => {});

      expect(getByTestId("streak-badge")).toBeTruthy();
    });

    it("does not render StreakBadge if streak is 0", async () => {
      const mockUseQuizHistory = useQuizHistory as jest.Mock;
      mockUseQuizHistory.mockReturnValue({
        getStats: () => ({
          totalQuizzes: 0,
          currentStreak: 0,
          bestScore: 0,
          lastQuizDate: 0,
        }),
        getSessions: () => [],
        addQuizSession: jest.fn(),
        clearHistory: jest.fn(),
        isLoading: false,
      });

      const { queryByTestId } = renderHomeScreen();
      await act(async () => {});

      expect(queryByTestId("streak-badge")).toBeNull();
    });

    it("renders DailyChallengeCard with today's country", async () => {
      const { getByTestId, getByText } = renderHomeScreen();
      await act(async () => {});

      expect(getByTestId("daily-challenge-card")).toBeTruthy();
      expect(getByText("Today's Challenge")).toBeTruthy();
    });

    it("navigates to QuizScreen when daily challenge card is pressed", async () => {
      const { getByTestId } = renderHomeScreen();

      await act(async () => {});

      fireEvent.press(getByTestId("daily-challenge-card-button"));

      expect(mockNavigate).toHaveBeenCalledWith(
        "Quiz",
        expect.objectContaining({
          countryCode: expect.any(String),
        })
      );
    });
  });
});
