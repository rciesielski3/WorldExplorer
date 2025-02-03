import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageBackground,
} from "react-native";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { styles } from "../styles";

const QuizScreen = () => {
  const [score, setScore] = React.useState(0);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [questions, setQuestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const { t } = useTranslation();

  React.useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all").then((response) => {
      const countries = response.data;
      const generatedQuestions = generateQuestions(countries);
      setQuestions(generatedQuestions);
      setLoading(false);
    });
  }, []);

  const generateQuestions = (countries) => {
    const questions = [];
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
          flag: randomCountry.flags.png,
          options: generateOptions(
            countries,
            randomCountry.name.common,
            "country"
          ),
          answer: randomCountry.name.common,
        };
      } else if (type === "capital") {
        question = {
          type: "capital",
          question: t("quizCapital", {
            country: randomCountry.name.common,
          }),
          options: generateOptions(
            countries,
            randomCountry.capital[0],
            "capital"
          ),
          answer: randomCountry.capital[0],
        };
      } else if (type === "country") {
        question = {
          type: "country",
          question: t("quizCountryCapital", {
            country: randomCountry.name.common,
          }),
          options: generateOptions(
            countries,
            randomCountry.name.common,
            "country"
          ),
          answer: randomCountry.name.common,
        };
      }
      questions.push(question);
    }
    return questions;
  };

  const generateOptions = (countries, correctAnswer, type) => {
    const options = [correctAnswer];
    while (options.length < 4) {
      const randomCountry =
        countries[Math.floor(Math.random() * countries.length)];
      const option =
        type === "capital"
          ? randomCountry.capital[0]
          : randomCountry.name.common;
      if (!options.includes(option)) {
        options.push(option);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer) => {
    if (answer === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
    setCurrentQuestion(currentQuestion + 1);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.containerContent}>
        <Text style={styles.title}>{t("quiz")}</Text>
        {currentQuestion < questions.length ? (
          <>
            <Text style={styles.subtitle}>
              {questions[currentQuestion].question}
            </Text>
            {questions[currentQuestion].type === "flag" && (
              <Image
                source={{ uri: questions[currentQuestion].flag }}
                style={{ width: 100, height: 60, marginVertical: 16 }}
              />
            )}
            {questions[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                style={styles.button}
                key={index}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.buttonText}> {option}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Text>
            {t("quizScore")} {score}/{questions.length}
          </Text>
        )}
      </View>
    </ImageBackground>
  );
};

export default QuizScreen;
