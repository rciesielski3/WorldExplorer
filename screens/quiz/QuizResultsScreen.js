import React from "react";
import {
  View,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../../context/ThemeContext";
import { getStyles } from "../../styles";

const QuizResultsScreen = ({ route, navigation }) => {
  const { score, questions } = route.params;
  const { t } = useTranslation();
  const { theme } = React.useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <ImageBackground
      source={require("../../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <ScrollView style={styles.containerScrollView}>
        <Text style={styles.title}>
          {t("quizScore")} {score}/{questions.length}
        </Text>

        {questions.map((question, index) => (
          <View style={styles.containerContent} key={index}>
            <Text style={styles.subtitle}>
              {t("quizQuestion")} {index + 1}
            </Text>
            <Text style={styles.questionText}>{question.question}</Text>
            {question.type === "flag" && (
              <Image source={{ uri: question.flag }} style={styles.flag} />
            )}
            <Text style={styles.correctAnswer}>
              {t("quizCorrectAnswer")}:{" "}
              <Text style={styles.buttonText}>{question.answer}</Text>
            </Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("Quiz")}
        >
          <Text style={styles.buttonText}>{t("quizTryAgain")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default QuizResultsScreen;
