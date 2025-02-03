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
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.buttonText}>Created by Rafał Ciesielski</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://rciesielski3.github.io/portfolio/")
              }
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: "lightblue", textDecorationLine: "underline" },
                ]}
              >
                Portfolio
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.buttonText, { fontSize: 12 }]}>
              © {new Date().getFullYear()} Adateo. All rights reserved.
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SettingsScreen;
