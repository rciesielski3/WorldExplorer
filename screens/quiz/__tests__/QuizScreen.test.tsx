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

  it("centers the question text horizontally", async () => {
    const practiceQuestions = [
      {
        type: "country",
        question: "Which country is highlighted on the map?",
        options: ["Alpha", "Beta", "Gamma", "Delta"],
        answer: "Alpha",
      },
    ];
    const { getByText } = renderQuizScreen({ practiceQuestions });

    await act(async () => {});

    const questionText = getByText("Which country is highlighted on the map?");
    expect(questionText.props.style).toEqual(
      expect.objectContaining({ textAlign: "center" })
    );
  });

  it("renders all five options (A-E) for a question with five answers", async () => {
    const practiceQuestions = [
      {
        type: "country",
        question: "Pick the correct capital",
        options: [
          "Option One",
          "Option Two",
          "Option Three",
          "Option Four",
          "Option Five",
        ],
        answer: "Option One",
      },
    ];
    const { getByTestId, queryByTestId } = renderQuizScreen({
      practiceQuestions,
    });

    await act(async () => {});

    ["A", "B", "C", "D", "E"].forEach((letter, index) => {
      expect(getByTestId(`quiz-answer-letter-${index}`).props.children).toBe(
        letter
      );
      expect(getByTestId(`quiz-answer-option-${index}`)).toBeTruthy();
    });

    // No sixth option/letter should be rendered.
    expect(queryByTestId("quiz-answer-option-5")).toBeNull();
    expect(queryByTestId("quiz-answer-letter-5")).toBeNull();
  });

  describe("daily challenge pre-selection (countryCode route param)", () => {
    it("still shows the difficulty selector when only countryCode is provided", async () => {
      const { getByText, queryByTestId } = renderQuizScreen({
        countryCode: "JPN",
      });

      await act(async () => {});

      // There is no country picker step in this screen (quizzes always draw
      // from every country, filtered by difficulty) so providing a
      // countryCode alone has nothing to "skip" — the difficulty selector
      // should render exactly as it does without any route params.
      expect(getByText("Select Difficulty")).toBeTruthy();
      expect(getByText("Easy")).toBeTruthy();
      expect(getByText("Medium")).toBeTruthy();
      expect(getByText("Hard")).toBeTruthy();
      expect(queryByTestId("question-progress")).toBeNull();
    });

    it("starts the quiz immediately when both countryCode and difficulty are provided", async () => {
      const { getByText, getByTestId, queryByText } = renderQuizScreen({
        countryCode: "JPN",
        difficulty: "easy",
      });

      await act(async () => {});

      // The difficulty selector should be skipped entirely and the first
      // question should already be showing.
      expect(queryByText("Select Difficulty")).toBeNull();
      expect(getByText(/Question 1 of \d+/)).toBeTruthy();
      expect(getByTestId("quiz-answer-option-0")).toBeTruthy();
    });

    it("does not auto-start when only difficulty is provided without a countryCode", async () => {
      const { getByText, queryByTestId } = renderQuizScreen({
        difficulty: "easy",
      });

      await act(async () => {});

      expect(getByText("Select Difficulty")).toBeTruthy();
      expect(queryByTestId("question-progress")).toBeNull();
    });

    it("does not re-trigger the quiz start on re-render (auto-start fires once)", async () => {
      const { getByText, getByTestId } = renderQuizScreen({
        countryCode: "JPN",
        difficulty: "easy",
      });

      await act(async () => {});
      expect(getByText(/Question 1 of \d+/)).toBeTruthy();

      // Answering the first question triggers a re-render; the auto-start
      // effect's dependencies are unchanged, so it must not fire again and
      // reset progress back to question 1.
      await act(async () => {
        fireEvent.press(getByTestId("quiz-answer-option-0"));
      });
      await act(async () => {
        fireEvent.press(getByText(/Next question|Finish quiz/));
      });

      expect(getByText(/Question 2 of \d+/)).toBeTruthy();
    });
  });

  it.each([1, 2, 3, 4])(
    "renders exactly %i option(s) with correct sequential letters",
    async (count: number) => {
      const allOptions = ["First", "Second", "Third", "Fourth"];
      const options = allOptions.slice(0, count);
      const practiceQuestions = [
        {
          type: "country",
          question: `Question with ${count} option(s)`,
          options,
          answer: options[0],
        },
      ];
      const { getByTestId, queryByTestId } = renderQuizScreen({
        practiceQuestions,
      });

      await act(async () => {});

      options.forEach((_option, index) => {
        const expectedLetter = String.fromCharCode(65 + index);
        expect(
          getByTestId(`quiz-answer-letter-${index}`).props.children
        ).toBe(expectedLetter);
        expect(getByTestId(`quiz-answer-option-${index}`)).toBeTruthy();
      });

      // No option beyond the provided count should be rendered.
      expect(queryByTestId(`quiz-answer-option-${count}`)).toBeNull();
    }
  );
});
