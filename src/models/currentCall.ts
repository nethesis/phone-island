// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface CurrentCallTypes {
  displayName?: string
  number?: string
  incomingSocket?: boolean
  incomingWebRTC?: boolean
  incoming?: boolean
  accepted?: boolean
  outgoing?: boolean
  startTime?: string
}

const defaultState = {
  displayName: '',
  number: '',
  incomingSocket: false,
  incomingWebRTC: false,
  incoming: false,
  accepted: false,
  outgoing: false,
  startTime: '',
}

export const currentCall = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateCurrentCall: (state, payload: CurrentCallTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
    reset: () => {
      return defaultState
    },
  },
  effects: (dispatch) => ({
    updateCurrentCallCheck: (payload: CurrentCallTypes, rootState) => {
      // Check both Socket and WebRTC for incoming call confirmation
      if (
        (rootState.currentCall.incomingSocket && payload.incomingWebRTC) ||
        (rootState.currentCall.incomingWebRTC && payload.incomingSocket)
      ) {
        payload.incoming = true
      }
      dispatch.currentCall.updateCurrentCall({
        ...payload,
      })
    },
  }),
})
