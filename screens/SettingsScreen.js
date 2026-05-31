import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ImageBackground,
  Linking,
} from "react-native";
import * as Constants from "expo-constants";
import { useTranslation } from "react-i18next";

import { Picker } from "@react-native-picker/picker";

import { ThemeContext } from "../context/ThemeContext";
import { usePremium } from "../context/PremiumContext";
import { getStyles } from "../styles";

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();

  const [language, setLanguage] = React.useState(i18n.language);
  const { theme } = React.useContext(ThemeContext);
  const {
    isPremium,
    isConfigured,
    isLoading,
    error,
    purchasePremium,
    restorePurchases,
  } = usePremium();

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
            {t("appVersion")}: {Constants.expoConfig?.version || "1.1.0"}
          </Text>
        </View>

        <View style={styles.settingItem}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.buttonText}>{t("premium")}</Text>
            <Text style={[styles.buttonText, { fontSize: 12, marginTop: 4 }]}>
              {isPremium ? t("premiumActive") : t("premiumDescription")}
            </Text>
            {error ? (
              <Text
                style={[
                  styles.buttonText,
                  { color: "#B00020", fontSize: 12, marginTop: 4 },
                ]}
              >
                {error}
              </Text>
            ) : null}
          </View>
          <View style={{ minWidth: 120 }}>
            <TouchableOpacity
              style={[
                styles.button,
                { padding: 10, marginBottom: 8 },
                (isPremium || !isConfigured || isLoading) && { opacity: 0.5 },
              ]}
              disabled={isPremium || !isConfigured || isLoading}
              onPress={purchasePremium}
            >
              <Text style={styles.buttonText}>
                {isLoading ? t("loading") : t("buyPremium")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { padding: 10, marginBottom: 0 },
                (!isConfigured || isLoading) && { opacity: 0.5 },
              ]}
              disabled={!isConfigured || isLoading}
              onPress={restorePurchases}
            >
              <Text style={styles.buttonText}>{t("restorePurchases")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 40, alignItems: "center" }}>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.buttonText}>Created by Rafał Ciesielski</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://rciesielski3.github.io/portfolio/#/contact"
                )
              }
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: "lightblue", textDecorationLine: "underline" },
                ]}
              >
                {t("contact")}
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
