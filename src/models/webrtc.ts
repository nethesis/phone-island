// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState = {
  INACTIVE_DEADLINE_TIME: 1000 * 60 * 45,
  CHECK_INTERVAL_TIME: 1000 * 60 * 50,
  sipcall: null,
  jsepGlobal: null,
  remoteAudioStream: null,
  localAudioStream: null,
  lastActivity: null,
  registered: false,
  destroyed: false,
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
    updateLocalAudioStream: (state, payload: any) => {
      state.localAudioStream = payload
      return state
    },
    updateLastActivity: (state, payload: any) => {
      return {
        ...state,
        lastActivity: payload,
      }
    },
  },
})

export interface WebRTCTypes {
  INACTIVE_DEADLINE_TIME?: number
  CHECK_INTERVAL_TIME?: number
  sipcall?: any
  jsepGlobal?: any
  remoteAudioStream?: any
  localAudioStream?: any
  lastActivity?: any
  registered?: boolean
  destroyed?: boolean
}
