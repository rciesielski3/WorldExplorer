import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { Linking } from "react-native";

import { ThemeContext } from "../context/ThemeContext";
import { getStyles } from "../styles";

const SettingsScreen = () => {
  const { theme } = React.useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = React.useState(i18n.language);

  const styles = getStyles(theme);

  const changeLanguage = (value) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.containerContent}>
        <Text style={styles.title}>{t("settings")}</Text>

        <View style={styles.settingItem}>
          <Text style={styles.buttonText}>{t("darkMode")}</Text>
          <Switch value={theme.isDarkMode} onValueChange={theme.toggleTheme} />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.buttonText}>{t("language")}</Text>
          <Picker
            selectedValue={language}
            onValueChange={changeLanguage}
            style={styles.picker}
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="Spanish" value="es" />
            <Picker.Item label="French" value="fr" />
            <Picker.Item label="German" value="de" />
            <Picker.Item label="Polish" value="pl" />
          </Picker>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.buttonText}>
            {t("appVersion")}: {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            Toast.show({
              type: "info",
              text1: "Created by Rafał Ciesielski",
              text2: "Click here to visit portfolio",
              onPress: () =>
                Linking.openURL("https://rciesielski3.github.io/portfolio/"),
              position: "bottom",
            })
          }
        >
          <Text style={styles.buttonText}>{t("aboutDeveloper")}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default SettingsScreen;
