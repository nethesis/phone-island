// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

export interface WebRTCTypes {
  sipcall?: any
  jsepGlobal?: any
}

const defaultState = {
  sipcall: null,
  jsepGlobal: null,
}

export const webrtc = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateWebRTC: (state, payload: WebRTCTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
  },
})
