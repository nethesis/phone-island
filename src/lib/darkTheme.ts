// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { setJSONItem, getJSONItem, eventDispatch } from '../utils'
import { store } from '../store'

const addDarkClassToDocument = () => {
  document.documentElement.classList.add('pi-dark')
}

const removeDarkClassFromDocument = () => {
  document.documentElement.classList.remove('pi-dark')
}

/**
 * Read theme from local storage and update global store
 */
export const checkDarkTheme = () => {
  const preferences = getJSONItem(`phone-island-theme-selected`) || {}
  let theme = 'system'

  if (preferences.themeSelected === 'dark') {
    theme = 'dark'
    addDarkClassToDocument()
  } else if (preferences.themeSelected === 'light') {
    theme = 'light'
    removeDarkClassFromDocument()
  } else {
    // system theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      addDarkClassToDocument()
    } else {
      removeDarkClassFromDocument()
    }
  }

  // update global store
  store.dispatch.darkTheme.update(theme)
}

export const setTheme = (theme: string) => {
  setJSONItem('phone-island-theme-selected', { themeSelected: theme })
  checkDarkTheme()
  eventDispatch('phone-island-theme-changed', {})
}
