import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Constants from "expo-constants";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { styles } from "../styles";

const SettingsScreen = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = (value) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  return (
    <ImageBackground
      source={require("../assets/worldMapBackground.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.containerContent}>
        <Text style={styles.title}>{t("settings")}</Text>

        <View style={styles.settingItem}>
          <Text style={{ color: "#333333" }}>{t("darkMode")}</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>

        <View style={styles.settingItem}>
          <Text style={{ color: "#333333" }}>{t("language")}</Text>
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
          <Text style={{ color: "#333333" }}>
            {t("appVersion")}: {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => alert("Created by Rafał Ciesielski")}
        >
          <Text style={styles.buttonText}>{t("aboutDeveloper")}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default SettingsScreen;
