import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import { initReactI18next } from "react-i18next";
import translation from './translation.json';

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,

    // These are namespaces, you should add an namespace for every view
    ns: ["default"],
    defaultNS: "default",
    fallbackNS: "default",

    interpolation: {
      escapeValue: false,
      formatSeparator: ","
    },

    resources: translation,

    react: {
      wait: true
    }
  });

export default i18n;