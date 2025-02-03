import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require("./locales/en.json") },
    es: { translation: require("./locales/es.json") },
    fr: { translation: require("./locales/fr.json") },
    de: { translation: require("./locales/de.json") },
    pl: { translation: require("./locales/pl.json") },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
