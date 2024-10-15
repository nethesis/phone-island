// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface DefaultState {
  isListen: boolean
  isListenExtension: string
  isIntrude: boolean
  isIntrudeExtension: string
}

const defaultState: DefaultState = {
  isListen: false,
  isListenExtension: '',
  isIntrude: false,
  isIntrudeExtension: '',
}

export const listen = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setUpdateListenStatus: (state, isListen: boolean, isListenExtension: string) => {
      state.isListen = isListen
      state.isListenExtension = isListenExtension
      return state
    },
    setUpdateIntrudeStatus: (state, isIntrude: boolean, isIntrudeExtension: string) => {
      state.isIntrude = isIntrude
      state.isIntrudeExtension = isIntrudeExtension
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
