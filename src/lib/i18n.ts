import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from '../../public/locales/en/translation.json'
import it from '../../public/locales/it/translation.json'

let isInitialized = false

export const initI18n = () => {
  if (isInitialized) {
    return Promise.resolve()
  }

  const i18nConfig = {
    resources: {
      en: { translations: en },
      it: { translations: it }
    },
    fallbackLng: 'en',
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['navigator']
    },
    react: {
      useSuspense: false
    },
    supportedLngs: ['en', 'it']
  }

  isInitialized = true
  return i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nConfig)
}

export default i18next.createInstance()
