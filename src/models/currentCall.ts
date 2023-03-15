// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import incomingRingtone from '../static/incoming_ringtone'
import outgoingRingtone from '../static/outgoing_ringtone'
import { dispatchOutgoingCallStarted } from '../events/index'

const defaultState = {
  displayName: '',
  username: '',
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
  muted: false,
  paused: false,
  keyboardValue: '',
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
    updateKeyboardValue: (state, payload: string) => {
      return {
        ...state,
        keyboardValue: payload,
      }
    },
    reset: () => {
      return defaultState
    },
  },
  effects: (dispatch) => ({
    checkIncomingUpdateAndPlay: (payload: CurrentCallTypes, rootState) => {
      // Check call type and incoming confirmation source
      if (
        (rootState.currentUser.default_device?.type === 'webrtc' &&
          (rootState.currentCall.incomingWebRTC || payload.incomingWebRTC)) ||
        (rootState.currentUser.default_device?.type === 'physical' &&
          (rootState.currentCall.incomingSocket || payload.incomingSocket))
      ) {
        payload.incoming = true

        // Update local player and play the audio
        dispatch.player.updateAndPlayAudioPlayer({ src: incomingRingtone, loop: true })
      }
      // Update the current call values and set incoming
      dispatch.currentCall.updateCurrentCall({
        ...payload,
      })
    },
    checkOutgoingUpdateAndPlay: (payload: CurrentCallTypes, rootState) => {
      // Check call type and outgoing confirmation source
      if (
        (rootState.currentUser.default_device?.type === 'webrtc' &&
          (rootState.currentCall.outgoingWebRTC || payload.outgoingWebRTC)) ||
        (rootState.currentUser.default_device?.type === 'physical' &&
          (rootState.currentCall.outgoingSocket || payload.outgoingSocket))
      ) {
        payload.outgoing = true
        // Update local player and play audio
        dispatch.player.updateAndPlayAudioPlayer({ src: outgoingRingtone, loop: true })
        // Dispatch an event for outgoing call
        dispatchOutgoingCallStarted(payload.displayName, payload.number)
      }
      // Update the current call values and set outgoing
      dispatch.currentCall.updateCurrentCall({
        ...payload,
      })
    },
    checkAcceptedUpdate: (payload: CurrentCallTypes, rootState) => {
      // Check call type and accepted confirmation source
      if (
        (rootState.currentUser.default_device?.type === 'webrtc' &&
          (rootState.currentCall.acceptedWebRTC || payload.acceptedWebRTC)) ||
        (rootState.currentUser.default_device?.type === 'physical' &&
          (rootState.currentCall.acceptedSocket || payload.acceptedSocket))
      ) {
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

export interface CurrentCallTypes {
  displayName?: string
  username?: string
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
  muted?: boolean
  paused?: boolean
}
