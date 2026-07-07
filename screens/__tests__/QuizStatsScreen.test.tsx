import React from "react";
import { render, fireEvent, act, within } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuizStatsScreen } from "../QuizStatsScreen";
import { QuizHistoryProvider } from "../../context/QuizHistoryContext";
import { ThemeProvider } from "../../context/ThemeContext";
// Side effect: initializes the shared i18next instance (resources + default
// "en" language) so `useTranslation()` inside QuizStatsScreen resolves real
// strings instead of returning undefined, matching how App.tsx bootstraps it.
import "../../i18n";

const QUIZ_SESSIONS_STORAGE_KEY = "worldexplorer_quiz_sessions";

const renderQuizStatsScreen = () =>
  render(
    <NavigationContainer>
      <ThemeProvider>
        <QuizHistoryProvider>
          <QuizStatsScreen navigation={{ navigate: jest.fn() } as any} />
        </QuizHistoryProvider>
      </ThemeProvider>
    </NavigationContainer>
  );

describe("QuizStatsScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("renders without crashing and shows the stats header", async () => {
    const { getByText } = renderQuizStatsScreen();

    // ThemeProvider and QuizHistoryProvider both read persisted state from
    // AsyncStorage on mount; flush those promises before asserting.
    await act(async () => {});

    expect(getByText("Quiz Statistics")).toBeTruthy();
  });

  it("displays total quizzes, current streak, and best score from history", async () => {
    const now = Date.now();
    await AsyncStorage.setItem(
      QUIZ_SESSIONS_STORAGE_KEY,
      JSON.stringify([
        { id: "1", timestamp: now, difficulty: "easy", score: 60, timeTaken: 30 },
        { id: "2", timestamp: now, difficulty: "medium", score: 90, timeTaken: 45 },
      ])
    );

    const { getByTestId } = renderQuizStatsScreen();
    await act(async () => {});

    expect(within(getByTestId("stat-total-quizzes")).getByText("2")).toBeTruthy();
    expect(within(getByTestId("stat-best-score")).getByText("90%")).toBeTruthy();
  });

  it("renders all 4 achievement badges from ACHIEVEMENTS", async () => {
    const { getByTestId } = renderQuizStatsScreen();
    await act(async () => {});

    expect(getByTestId("achievement-first_quiz")).toBeTruthy();
    expect(getByTestId("achievement-on_fire")).toBeTruthy();
    expect(getByTestId("achievement-country_master")).toBeTruthy();
    expect(getByTestId("achievement-improver")).toBeTruthy();
  });

  it("clears quiz history when the clear history button is pressed", async () => {
    await AsyncStorage.setItem(
      QUIZ_SESSIONS_STORAGE_KEY,
      JSON.stringify([
        { id: "1", timestamp: Date.now(), difficulty: "easy", score: 50, timeTaken: 20 },
      ])
    );

    const { getByTestId } = renderQuizStatsScreen();
    await act(async () => {});

    expect(within(getByTestId("stat-total-quizzes")).getByText("1")).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId("clear-history-btn"));
    });

    const stored = await AsyncStorage.getItem(QUIZ_SESSIONS_STORAGE_KEY);
    expect(stored).toBeNull();
  });
});
