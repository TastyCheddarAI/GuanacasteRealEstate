import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

// the translations
// (tip: move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      "Welcome to React": "Welcome to React and react-i18next"
    }
  },
  es: {
    translation: {
      "Welcome to React": "Bienvenido a React y react-i18next"
    }
  }
}

i18next
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    lng: 'en', // language to use, more info here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false // react already does escaping
    }
  })

export default i18next

// Utility functions
export const changeLanguage = (lng: 'en' | 'es') => {
  i18next.changeLanguage(lng)
}

export const getCurrentLanguage = () => {
  return i18next.language
}

export const t = (key: string, options?: any) => {
  return i18next.t(key, options)
}