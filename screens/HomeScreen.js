import React from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";
import LottieView from "lottie-react-native";

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const { theme } = React.useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <LottieView
          source={require("../assets/animations/explore.json")}
          autoPlay
          loop
          style={{
            width: 200,
            height: 200,
            alignSelf: "center",
          }}
        />
        <View style={styles.containerButtons}>
          <Text style={styles.title}>{t("welcome")} World Explorer</Text>
          <View style={{ width: "100%" }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Explore")}
            >
              <Text style={styles.buttonText}>{t("explore")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Map")}
            >
              <Text style={styles.buttonText}>{t("map")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Quiz")}
            >
              <Text style={styles.buttonText}>{t("quiz")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Settings")}
            >
              <Text style={styles.buttonText}>{t("settings")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;
