// Copyright (C) 2024 Nethesis S.r.l.
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
  localVideoStream: null as MediaStream | null,
  remoteVideoStream: null as MediaStream | null,
  lastActivity: null,
  screenShare: null,
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
    updateLocalVideoStream: (state, payload: MediaStream) => {
      state.localVideoStream = payload
      return state
    },
    updateRemoteVideoStream: (state, payload: MediaStream) => {
      state.remoteVideoStream = payload
      return state
    },
  },
})

export interface WebRTCTypes {
  INACTIVE_DEADLINE_TIME?: number
  CHECK_INTERVAL_TIME?: number
  sipcall?: any
  jsepGlobal?: any
  remoteAudioStream?: any
  localAudioStream?: null
  lastActivity?: any
  screenShare?: any
  registered?: boolean
  destroyed?: boolean
}
