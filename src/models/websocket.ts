// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

export interface WebsocketTypes {
  socket: any
}

const defaultState: WebsocketTypes = {
  socket: null as any,
}

export const websocket = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    update: (state, payload: WebsocketTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
    reset: () => {
      return defaultState
    },
  },
})
