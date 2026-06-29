import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageBackground,
} from "react-native";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../../context/ThemeContext";
import { getStyles } from "../../styles";
import AdBanner from "../../components/AdBanner";
import { fetchCountries, getLocalizedCountryName } from "../../utils/countries";
import { FLAG_ASSETS } from "../../utils/flagAssets";

const {
  answerQuestion,
  countCorrectAnswers,
  getScoreMessageKey,
} = require("./quizSession");

const QuizScreen = ({ route, navigation }) => {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [questions, setQuestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedAnswer, setSelectedAnswer] = React.useState(null);
  const { theme } = React.useContext(ThemeContext);
  const { t } = useTranslation();
  const styles = getStyles(theme);
  const practiceQuestions = route.params?.practiceQuestions;

  React.useEffect(() => {
    if (practiceQuestions?.length) {
      setQuestions(
        practiceQuestions.map(
          ({
            selectedAnswer: _selectedAnswer,
            isCorrect: _isCorrect,
            ...question
          }) => question,
        ),
      );
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    fetchCountries()
      .then((countries) => {
        if (isMounted) {
          const generatedQuestions = generateQuestions(countries);
          setQuestions(generatedQuestions);
          setLoading(false);
        }
      })
      .catch((error) => console.error("Error fetching countries:", error));

    return () => (isMounted = false);
  }, [practiceQuestions]);

  const generateQuestions = (countries) => {
    const generatedQuestions = [];

    for (let i = 0; i < 10; i++) {
      const randomCountry =
        countries[Math.floor(Math.random() * countries.length)];
      const questionTypes = ["flag", "capital", "country"];
      const type =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let question = {};
      if (type === "flag") {
        question = {
          type: "flag",
          question: t("quizFlagBelong"),
          flag: randomCountry.flagPath || "",
          options: generateOptions(
            countries,
            getLocalizedCountryName(randomCountry, i18n.language),
            "country",
          ),
          answer: getLocalizedCountryName(randomCountry, i18n.language),
        };
      } else if (type === "capital") {
        question = {
          type: "capital",
          question: t("quizCapital", {
            country: getLocalizedCountryName(randomCountry, i18n.language),
          }),
          options: generateOptions(
            countries,
            randomCountry.capital || t("noCapital"),
            "capital",
          ),
          answer: randomCountry.capital || t("noCapital"),
        };
      } else {
        question = {
          type: "country",
          question: t("quizCountryCapital", {
            country: getLocalizedCountryName(randomCountry, i18n.language),
          }),
          options: generateOptions(
            countries,
            getLocalizedCountryName(randomCountry, i18n.language),
            "country",
          ),
          answer: getLocalizedCountryName(randomCountry, i18n.language),
        };
      }
      generatedQuestions.push(question);
    }
    return generatedQuestions;
  };

  const generateOptions = (countries, correctAnswer, type) => {
    const options = new Set([correctAnswer]);

    while (options.size < 4) {
      const randomCountry =
        countries[Math.floor(Math.random() * countries.length)];
      const option =
        type === "capital"
          ? randomCountry.capital || t("noCapital")
          : getLocalizedCountryName(randomCountry, i18n.language);

      options.add(option);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer) {
      return;
    }

    setSelectedAnswer(answer);
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, index) =>
        index === currentQuestion ? answerQuestion(question, answer) : question,
      ),
    );
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestion((prev) => prev + 1);
  };

  const answeredQuestion = questions[currentQuestion];
  const hasAnsweredCurrentQuestion = Boolean(selectedAnswer);
  const score = countCorrectAnswers(questions);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.containerContent}>
        <Text style={styles.title}>{t("quiz")}</Text>

        {currentQuestion < questions.length ? (
          <>
            <View style={styles.settingItem}>
              <Text style={styles.subtitle}>
                {questions[currentQuestion].question}
              </Text>
            </View>

            {questions[currentQuestion].type === "flag" && (
              <Image
                source={FLAG_ASSETS[questions[currentQuestion].flag]}
                style={{
                  width: 200,
                  height: 120,
                  borderRadius: 4,
                  alignSelf: "center",
                  marginBottom: 20,
                }}
              />
            )}

            {questions[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                style={[
                  styles.button,
                  hasAnsweredCurrentQuestion &&
                    option === answeredQuestion.answer &&
                    styles.correctOption,
                  hasAnsweredCurrentQuestion &&
                    option === selectedAnswer &&
                    option !== answeredQuestion.answer &&
                    styles.incorrectOption,
                ]}
                key={index}
                onPress={() => handleAnswer(option)}
                disabled={hasAnsweredCurrentQuestion}
              >
                <Text style={styles.buttonText}>{option}</Text>
              </TouchableOpacity>
            ))}

            {hasAnsweredCurrentQuestion && (
              <View style={styles.quizFeedbackCard}>
                <Text style={styles.quizFeedbackTitle}>
                  {answeredQuestion.isCorrect
                    ? t("quizAnswerCorrect")
                    : t("quizAnswerIncorrect")}
                </Text>
                <Text style={styles.quizFeedbackText}>
                  {t("quizYourAnswer")}: {selectedAnswer}
                </Text>
                {!answeredQuestion.isCorrect && (
                  <Text style={styles.quizFeedbackText}>
                    {t("quizCorrectAnswer")}: {answeredQuestion.answer}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleNextQuestion}
                >
                  <Text style={styles.buttonText}>
                    {currentQuestion + 1 === questions.length
                      ? t("quizFinish")
                      : t("quizNextQuestion")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.subtitle2}>
              {t("questionProgress", {
                current: currentQuestion + 1,
                total: questions.length,
              })}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {t("quizScore")} {score}/{questions.length}
            </Text>
            <Text style={styles.subtitle2}>
              {t(getScoreMessageKey(score, questions.length))}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("QuizResults", { score, questions })
              }
            >
              <Text style={styles.buttonText}>{t("quizViewAnswers")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.replace("Quiz")}
            >
              <Text style={styles.buttonText}>{t("quizTryAgain")}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <AdBanner />
    </ImageBackground>
  );
};

export default QuizScreen;
