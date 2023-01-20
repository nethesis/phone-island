// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import incomingRingtone from '../static/incoming_ringtone'
import outgoingRingtone from '../static/outgoing_ringtone'
import { dispatchOutgoingCallStarted } from '../events/index'

const defaultState = {
  displayName: '',
  number: '',
  incomingSocket: false,
  incomingWebRTC: false,
  incoming: false,
  accepted: false,
  outgoingSocket: false,
  outgoingWebRTC: false,
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
    checkIncomingUpdateAndPlay: (payload: CurrentCallTypes, rootState) => {
      // Check both Socket and WebRTC for incoming call confirmation
      if (
        !rootState.currentCall.incoming &&
        ((rootState.currentCall.incomingSocket && payload.incomingWebRTC) ||
          (rootState.currentCall.incomingWebRTC && payload.incomingSocket))
      ) {
        payload.incoming = true
        // Update local player and play the audio
        dispatch.player.updateAndPlayLocalAudio(incomingRingtone)
      }
      // Update the current call values
      dispatch.currentCall.updateCurrentCall({
        ...payload,
      })
    },
    checkOutgoingUpdateAndPlay: (payload: CurrentCallTypes, rootState) => {
      // Check both Socket and WebRTC for incoming call confirmation
      if (
        !rootState.currentCall.outgoing &&
        ((rootState.currentCall.outgoingSocket && payload.outgoingWebRTC) ||
          (rootState.currentCall.outgoingWebRTC && payload.outgoingSocket))
      ) {
        payload.outgoing = true
        // Update local player and play audio
        dispatch.player.updateAndPlayLocalAudio(outgoingRingtone)
        // Dispatch an event for outgoing call
        dispatchOutgoingCallStarted(payload.displayName, payload.number)
      }
      // Update the current call values
      dispatch.currentCall.updateCurrentCall({
        ...payload,
      })
    },
  }),
})

interface CurrentCallTypes {
  displayName?: string
  number?: string
  incomingSocket?: boolean
  incomingWebRTC?: boolean
  incoming?: boolean
  accepted?: boolean
  outgoingSocket?: boolean
  outgoingWebRTC?: boolean
  outgoing?: boolean
  startTime?: string
}
