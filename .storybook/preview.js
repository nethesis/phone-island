// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import '../src/index.css'

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
