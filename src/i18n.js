import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importez vos fichiers de traduction
import translationEN from './locales/en/translation.json'
import translationFR from './locales/fr/translation.json'


const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
}

i18n
  .use(LanguageDetector) // Détecte la langue de l'utilisateur
  .use(initReactI18next) // Lie i18n à React
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut en cas d'erreur
    debug: true, // Désactivez-le en production
    interpolation: {
      escapeValue: false, // Ne pas échapper le code HTML
    },
  })

export default i18n
