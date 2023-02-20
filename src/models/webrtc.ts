// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState = {
  sipcall: null,
  jsepGlobal: null,
  remoteAudioStream: null,
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
    updateRemoteAudioStream: (state, payload: any) => {
      return {
        ...state,
        remoteAudioStream: payload,
      }
    },
  },
})

export interface WebRTCTypes {
  sipcall?: any
  jsepGlobal?: any
  remoteAudioStream?: any
}
