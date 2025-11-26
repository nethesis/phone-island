// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import { dispatchOutgoingCallStarted } from '../events/index'
import { eventDispatch } from '../utils'
import { PhonebookContact } from '../types/phonebook'

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
  parked: false,
  outgoing: false,
  startTime: '',
  muted: false,
  paused: false,
  keypadValue: '',
  conversationId: '',
  transferring: false,
  conferencing: false,
  transferringName: '',
  transferringNumber: '',
  transferringStartTime: '',
  transferSwitching: false,
  transferCalls: new Array(),
  ownerExtension: '',
  isRecording: false,
  isLocalVideoEnabled: false,
  showRemoteVideoPlaceHolder: true,
  hasVideoTrackAdded: false,
  isStartingVideoCall: false,
  streamingSourceNumber: '',
  chDest: new Array(),
  chSource: new Array(),
}

export const currentCall = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateCurrentCall: (state, payload: CurrentCallTypes) => {
      if (Number(payload.startTime) && state.startTime) {
        // avoid updating startTime if it's already set (e.g. while switching to a video call)
        delete payload.startTime
      }

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
    deleteTransferCalls: (state) => {
      return {
        ...state,
        transferCalls: state.transferCalls.filter((item) => item.type !== 'transferred'),
      }
    },
    setParked: (state, payload: boolean) => {
      state.parked = payload
      return state
    },
    updateRecordingStatus: (state, payload: boolean) => {
      state.isRecording = payload
      return state
    },
    updateStartTime: (state, payload: string) => {
      state.startTime = payload
      return state
    },
    updateIncoming: (state, payload: boolean) => {
      state.incoming = payload
      return state
    },
    reset: () => {
      return defaultState
    },
    setLocalVideoEnabled: (state, payload: boolean) => {
      state.isLocalVideoEnabled = payload
      return state
    },
    setVideoTrackAdded: (state, payload: boolean) => {
      state.hasVideoTrackAdded = payload
      return state
    },
    updateConferencing: (state, payload: boolean) => {
      return {
        ...state,
        conferencing: payload,
      }
    },
  },
  effects: (dispatch) => ({
    checkIncomingUpdatePlay: (payload: CurrentCallTypes, rootState) => {
      // Check call type and incoming confirmation source
      if (
        (rootState?.currentUser?.default_device?.type === 'webrtc' && payload?.incomingWebRTC) ||
        (rootState?.currentUser?.default_device?.type === 'physical' && payload?.incomingSocket) ||
        (rootState?.currentUser?.default_device?.type === 'nethlink' && payload?.incomingWebRTC)
      ) {
        payload.incoming = true

        // Get selected ringtone from store and play the audio
        const selectedRingtoneAudio = rootState.ringtones
          ? (rootState.ringtones.availableRingtones as any[]).find(
              (r: any) => r.name === rootState.ringtones.selectedRingtone,
            )?.base64Audio || rootState.ringtones.availableRingtones[0]?.base64Audio
          : undefined
        
        if (selectedRingtoneAudio) {
          dispatch.player.updateStartAudioPlayer({ src: selectedRingtoneAudio, loop: true })
        }
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
        (rootState.currentUser.default_device?.type === 'physical' && payload.outgoingSocket) ||
        (rootState.currentUser.default_device?.type === 'nethlink' && payload.outgoingWebRTC)
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
        (rootState.currentUser.default_device?.type === 'physical' && payload.acceptedSocket) ||
        (rootState.currentUser.default_device?.type === 'nethlink' && payload.acceptedWebRTC)
      ) {
        payload.accepted = true
        eventDispatch('phone-island-call-answered', {})
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

export type chDestTypes = {
  type: 'dest'
  channel: string
  callerNum: string
  startTime: number
  callerName: string
  bridgedNum: string
  bridgedName: string
  inConference: boolean
  channelStatus: string
  bridgedChannel: string
}

export type chSourceTypes = {
  type: 'source'
  channel: string
  callerNum: string
  startTime: number
  callerName: string
  bridgedNum: string
  bridgedName: string
  inConference: boolean
  channelStatus: string
  bridgedChannel: string
}

export interface CurrentCallTypes {
  displayName?: string
  username?: string
  number?: string
  incomingSocket?: boolean
  incomingWebRTC?: boolean
  parked?: boolean
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
  conferencing?: boolean
  transferringName?: string
  transferringNumber?: string
  transferringStartTime?: string
  transferSwitching?: boolean
  transferCalls?: TransferCallsTypes[]
  ownerExtension?: string
  isRecording?: boolean
  isLocalVideoEnabled?: boolean
  hasVideoTrackAdded?: boolean
  showRemoteVideoPlaceHolder?: boolean
  isStartingVideoCall?: boolean
  streamingSourceNumber?: string
  chDest?: any
  chSource?: any
}
