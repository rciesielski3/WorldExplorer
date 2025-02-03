import React, { useState, useEffect, useContext } from "react";
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

import { ThemeContext } from "../../context/ThemeContext";
import { getStyles } from "../../styles";

const QuizScreen = ({ navigation }) => {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const styles = getStyles(theme);

  // Fetch and Generate Questions
  useEffect(() => {
    let isMounted = true;
    axios
      .get("https://restcountries.com/v3.1/all")
      .then((response) => {
        if (isMounted) {
          const countries = response.data;
          const generatedQuestions = generateQuestions(countries);
          setQuestions(generatedQuestions);
          setLoading(false);
        }
      })
      .catch((error) => console.error("Error fetching countries:", error));

    return () => (isMounted = false); // Cleanup function
  }, []);

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
          flag: randomCountry.flags?.png || "",
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
            randomCountry.capital?.[0] || t("noCapital"),
            "capital"
          ),
          answer: randomCountry.capital?.[0] || t("noCapital"),
        };
      } else {
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
          ? randomCountry.capital?.[0] || t("noCapital")
          : randomCountry.name.common;

      options.add(option);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer) => {
    if (answer === questions[currentQuestion].answer) {
      setScore((prevScore) => prevScore + 1);
    }
    setCurrentQuestion((prev) => prev + 1);
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
                source={{ uri: questions[currentQuestion].flag }}
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
                style={styles.button}
                key={index}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.buttonText}>{option}</Text>
              </TouchableOpacity>
            ))}

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
    </ImageBackground>
  );
};

export default QuizScreen;
