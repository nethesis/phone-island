import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const fallbackLng = ['en']

const options = {
  // User language is detected from the navigator
  order: ['navigator'],
}

export const loadI18n = (loadPath?: string) => {
  if (typeof window === 'undefined') {
    return
  }
  i18next
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      ...(loadPath ? {
        backend: {
          loadPath
        }
      } : {}),
      fallbackLng,
      load: 'languageOnly',
      debug: true,
      detection: options,
      interpolation: {
        escapeValue: false,
      },
    })
}

export default loadI18n
