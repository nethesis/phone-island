// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import '../src/index.css'
import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import translationIT from '../public/locales/it/translation.json'
import translationEN from '../public/locales/en/translation.json'

i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      it: {
        translation: translationIT,
      },
      en: {
        translation: translationEN,
      },
    },
    lng: 'it',
    fallbackLng: ['en'],
    load: 'languageOnly',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator'],
    },
  })

export const parameters = {
  layout: 'fullscreen',
  options: {
    showPanel: false,
    isToolshown: false,
    enableShortcuts: false,
    showToolbar: false,
    showNav: false,
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
