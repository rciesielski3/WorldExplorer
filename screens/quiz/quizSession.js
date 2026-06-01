const answerQuestion = (question, selectedAnswer) => ({
  ...question,
  selectedAnswer,
  isCorrect: selectedAnswer === question.answer,
});

const countCorrectAnswers = (questions) =>
  questions.filter((question) => question.isCorrect).length;

const getIncorrectQuestions = (questions) =>
  questions.filter((question) => question.isCorrect === false);

const getScoreMessageKey = (score, total) => {
  if (!total) {
    return "quizScorePractice";
  }

  const ratio = score / total;

  if (ratio >= 0.8) {
    return "quizScoreGreat";
  }

  if (ratio >= 0.5) {
    return "quizScoreGood";
  }

  return "quizScorePractice";
};

module.exports = {
  answerQuestion,
  countCorrectAnswers,
  getIncorrectQuestions,
  getScoreMessageKey,
};
