// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import incomingRingtone from '../static/incoming_ringtone'
import outgoingRingtone from '../static/outgoing_ringtone'
import { dispatchOutgoingCallStarted } from '../events/index'
import { confirmCallStatus } from '../lib/phone/call'

const defaultState = {
  displayName: '',
  number: '',
  incomingSocket: false,
  incomingWebRTC: false,
  incoming: false,
  acceptedSocket: false,
  acceptedWebRTC: false,
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
    checkIncomingUpdateAndPlay: (payload: CurrentCallTypes) => {
      // Check both Socket and WebRTC for incoming call confirmation
      if (confirmCallStatus(payload, 'incoming')) {
        payload.incoming = true
        // Update local player and play the audio
        dispatch.player.updateAndPlayLocalAudio(incomingRingtone)
      }
      // Update the current call values
      dispatch.currentCall.updateCurrentCall({
        ...payload,
      })
    },
    checkOutgoingUpdateAndPlay: (payload: CurrentCallTypes) => {
      // Check both Socket and WebRTC for incoming call confirmation
      if (confirmCallStatus(payload, 'outgoing')) {
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
    checkAcceptedUpdateAndPlay: (payload: CurrentCallTypes) => {
      // Check both Socket and WebRTC for incoming call confirmation
      if (confirmCallStatus(payload, 'accepted')) {
        payload.accepted = true
        // TODO - add accepted event
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
  acceptedSocket?: boolean
  acceptedWebRTC?: boolean
  accepted?: boolean
  outgoingSocket?: boolean
  outgoingWebRTC?: boolean
  outgoing?: boolean
  startTime?: string
}
