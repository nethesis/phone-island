// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { RefObject } from 'react'
import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: PhysicalRecorderTypes = {
  recording: false,
  visibleContainerRef: null,
  recorded: false,
  currentTime: '00:00:00',
  tempFileName: '',
  startTime: '',
  conversationId: '',
  ownerExtension: '',
  recordingTempVariable: false,
}

export const physicalRecorder = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setRecording: (state, payload: boolean) => {
      state.recording = payload
      return state
    },
    setVisibleContainerRef: (state, payload: RefObject<HTMLDivElement>) => {
      state.visibleContainerRef = payload
      return state
    },
    setRecorded: (state, payload: boolean) => {
      state.recorded = payload
      return state
    },
    setCurrentTime: (state, payload: string) => {
      state.currentTime = payload
      return state
    },
    resetRecorded: (state, _: void) => {
      return {
        ...defaultState,
        visibleContainerRef: state.visibleContainerRef,
      }
    },
    setTempFilename: (state, payload: string) => {
      state.tempFileName = payload
      return state
    },
    setStartTime: (state, payload: string) => {
      state.startTime = payload
      return state
    },
    setCallRecordingInformations: (state, payload: any) => {
      state.conversationId = payload.recordingCallInformation.conversationId
      state.ownerExtension = payload.recordingCallInformation.endpointId
      return state
    },
    setRecordingTempVariable: (state, payload: boolean) => {
      state.recordingTempVariable = payload
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})

interface PhysicalRecorderTypes {
  recording: boolean
  visibleContainerRef: RefObject<HTMLDivElement> | null
  recorded: boolean
  currentTime: string
  tempFileName: string
  startTime: string
  ownerExtension?: any
  conversationId?: string
  recordingTempVariable: boolean
}
