// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import '../src/index.css'
import { initI18n } from '../src/lib/i18n'

initI18n()

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
