const test = require("node:test");
const assert = require("node:assert/strict");

const {
  answerQuestion,
  countCorrectAnswers,
  getIncorrectQuestions,
  getScoreMessageKey,
} = require("./quizSession");

const baseQuestions = [
  {
    question: "Capital of Poland?",
    answer: "Warsaw",
    options: ["Warsaw", "Berlin", "Paris", "Madrid"],
  },
  {
    question: "Capital of France?",
    answer: "Paris",
    options: ["Warsaw", "Berlin", "Paris", "Madrid"],
  },
];

test("answerQuestion stores selected answer and correctness without mutating the original question", () => {
  const answered = answerQuestion(baseQuestions[0], "Warsaw");

  assert.equal(answered.selectedAnswer, "Warsaw");
  assert.equal(answered.isCorrect, true);
  assert.equal(baseQuestions[0].selectedAnswer, undefined);
});

test("countCorrectAnswers counts only correctly answered questions", () => {
  const answeredQuestions = [
    answerQuestion(baseQuestions[0], "Warsaw"),
    answerQuestion(baseQuestions[1], "Berlin"),
  ];

  assert.equal(countCorrectAnswers(answeredQuestions), 1);
});

test("getIncorrectQuestions returns questions answered incorrectly", () => {
  const answeredQuestions = [
    answerQuestion(baseQuestions[0], "Warsaw"),
    answerQuestion(baseQuestions[1], "Berlin"),
  ];

  assert.deepEqual(getIncorrectQuestions(answeredQuestions), [
    {
      ...baseQuestions[1],
      selectedAnswer: "Berlin",
      isCorrect: false,
    },
  ]);
});

test("getScoreMessageKey selects a message based on score ratio", () => {
  assert.equal(getScoreMessageKey(10, 10), "quizScoreGreat");
  assert.equal(getScoreMessageKey(6, 10), "quizScoreGood");
  assert.equal(getScoreMessageKey(2, 10), "quizScorePractice");
  assert.equal(getScoreMessageKey(0, 0), "quizScorePractice");
});
