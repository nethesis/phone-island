// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import incomingRingtone from '../static/incoming_ringtone'
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
  keypadValue: '',
  conversationId: '',
  transferring: false,
  transferringName: '',
  transferringNumber: '',
  transferringStartTime: '',
  transferSwitching: false,
  transferCalls: new Array(),
}

export const currentCall = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateCurrentCall: (state, payload: CurrentCallTypes) => {
      return {
        ...state,
        ...payload,
        transferCalls: state.transferCalls,
      }
    },
    updateKeypadValue: (state, payload: string) => {
      return {
        ...state,
        keypadValue: payload,
      }
    },
    updateTransferring: (state, payload: boolean) => {
      return {
        ...state,
        transferring: payload,
      }
    },
    updateTransferSwitching: (state, payload: boolean) => {
      return {
        ...state,
        transferSwitching: payload,
      }
    },
    addTransferCalls: (state, payload: TransferCallsTypes) => {
      if (state.transferCalls.find((item) => item.number === payload.number)) {
        return state
      } else {
        return {
          ...state,
          transferCalls: [...state.transferCalls, payload],
        }
      }
    },
    reset: () => {
      return defaultState
    },
  },
  effects: (dispatch) => ({
    checkIncomingUpdatePlay: (payload: CurrentCallTypes, rootState) => {
      // Check call type and incoming confirmation source
      if (
        (rootState.currentUser.default_device?.type === 'webrtc' && payload.incomingWebRTC) ||
        (rootState.currentUser.default_device?.type === 'physical' && payload.incomingSocket)
      ) {
        payload.incoming = true

        // Update local player and play the audio
        dispatch.player.updateStartAudioPlayer({ src: incomingRingtone, loop: true })
      }
      // Update the current call values and set incoming
      dispatch.currentCall.updateCurrentCall({
        ...payload,
      })
    },
    checkOutgoingUpdate: (payload: CurrentCallTypes, rootState) => {
      // Check call type and outgoing confirmation source
      if (
        (rootState.currentUser.default_device?.type === 'webrtc' && payload.outgoingWebRTC) ||
        (rootState.currentUser.default_device?.type === 'physical' && payload.outgoingSocket)
      ) {
        payload.outgoing = true
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
        (rootState.currentUser.default_device?.type === 'webrtc' && payload.acceptedWebRTC) ||
        (rootState.currentUser.default_device?.type === 'physical' && payload.acceptedSocket)
      ) {
        payload.accepted = true
        // TODO - dispatch accepted event
      }
      // Update the current call values
      dispatch.currentCall.updateCurrentCall({
        ...payload,
      })
    },
  }),
})

export type TransferCallsTypes = {
  type: 'transferred' | 'destination'
  displayName: string
  number: string
  startTime: string
}

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
  conversationId?: string
  transferring?: boolean
  transferringName?: string
  transferringNumber?: string
  transferringStartTime?: string
  transferSwitching?: boolean
  transferCalls?: TransferCallsTypes[]
}
