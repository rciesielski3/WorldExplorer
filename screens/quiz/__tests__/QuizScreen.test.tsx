import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import QuizScreen from "../QuizScreen";
import { ThemeProvider } from "../../../context/ThemeContext";
// Side effect: initializes the shared i18next instance (resources + default
// "en" language) so `useTranslation()` inside QuizScreen resolves real
// strings instead of returning undefined, matching how App.tsx bootstraps it.
import "../../../i18n";

// AdBanner renders a native react-native-google-mobile-ads component; stub it
// out (mirrors ExploreScreen.test.tsx / CountryDetailsScreen.test.tsx) since
// ad delivery isn't what this test exercises.
jest.mock("../../../src/components/AdBanner", () => "AdBanner");

const navigate = jest.fn();

const renderQuizScreen = (routeParams: any = {}) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <NavigationContainer>
        <ThemeProvider>
          <QuizScreen
            navigation={{ navigate } as any}
            route={{ key: "Quiz", name: "Quiz", params: routeParams } as any}
          />
        </ThemeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );

describe("QuizScreen", () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  it("shows the difficulty selector when no quiz has started yet", async () => {
    const { getByText, queryByTestId } = renderQuizScreen();

    await act(async () => {});

    expect(getByText("Select Difficulty")).toBeTruthy();
    expect(getByText("Easy")).toBeTruthy();
    expect(getByText("Medium")).toBeTruthy();
    expect(getByText("Hard")).toBeTruthy();
    // No question should be showing until a difficulty is chosen.
    expect(queryByTestId("question-progress")).toBeNull();
  });

  it("starts the quiz and hides the selector once a difficulty is chosen", async () => {
    const { getByText, queryByText } = renderQuizScreen();

    await act(async () => {});

    await act(async () => {
      fireEvent.press(getByText("Easy"));
    });

    // The selector should disappear once questions are generated.
    expect(queryByText("Select Difficulty")).toBeNull();
    // A generated capital question should now be visible.
    expect(getByText(/Question 1 of \d+/)).toBeTruthy();
  });

  it("passes the selected difficulty and a timeTaken to QuizResults when finishing", async () => {
    const { getByText, getByTestId, queryByTestId } = renderQuizScreen();

    await act(async () => {});
    await act(async () => {
      fireEvent.press(getByText("Hard"));
    });

    // Answer every generated question (always option index 0) to reach the
    // "Quiz Complete" screen.
    let safety = 0;
    while (queryByTestId("question-progress") && safety < 20) {
      safety += 1;
      await act(async () => {
        fireEvent.press(getByTestId("quiz-answer-option-0"));
      });
      const nextOrFinish = queryByTestId("question-progress")
        ? getByText(/Next question|Finish quiz/)
        : null;
      if (nextOrFinish) {
        await act(async () => {
          fireEvent.press(nextOrFinish);
        });
      }
    }

    await act(async () => {
      fireEvent.press(getByText("View answers"));
    });

    expect(navigate).toHaveBeenCalledWith(
      "QuizResults",
      expect.objectContaining({
        difficulty: "hard",
        timeTaken: expect.any(Number),
      })
    );
  });
});
