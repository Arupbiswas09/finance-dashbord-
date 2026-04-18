import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// import translations
import en from "../locales/en.json";
import de from "../locales/de.json";
import fr from "../locales/fr.json";
import nl from "../locales/nl.json";

const storedLang =
  typeof window !== "undefined" ? localStorage.getItem("i18nextLng") || "en" : "en";
const resources = {
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    nl: { translation: nl },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: storedLang,
        fallbackLng: 'en', // Changed fallback to 'en'
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;