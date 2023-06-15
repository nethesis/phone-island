// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { RefObject } from 'react'
import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: RecorderTypes = {
  recording: false,
  waiting: false,
  incoming: false,
  visibleContainerRef: null,
  frequency: 0,
  recorded: false,
  playing: false,
  paused: false,
  currentTime: '00:00:00',
  tempFileName: '',
}

export const recorder = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setRecording: (state, payload: boolean) => {
      state.recording = payload
      return state
    },
    setWaiting: (state, payload: boolean) => {
      state.waiting = payload
      return state
    },
    setIncoming: (state, payload: boolean) => {
      state.incoming = payload
      return state
    },
    setVisibleContainerRef: (state, payload: RefObject<HTMLDivElement>) => {
      state.visibleContainerRef = payload
      return state
    },
    setFrequency: (state, payload: number) => {
      state.frequency = payload
      return state
    },
    setRecorded: (state, payload: boolean) => {
      state.recorded = payload
      return state
    },
    setPlaying: (state, payload: boolean) => {
      state.playing = payload
      return state
    },
    setPaused: (state, payload: boolean) => {
      state.paused = payload
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
    reset: () => {
      return defaultState
    },
  },
})

interface RecorderTypes {
  recording: boolean
  waiting: boolean
  incoming: boolean
  visibleContainerRef: RefObject<HTMLDivElement> | null
  frequency: number
  recorded: boolean
  playing: boolean
  paused: boolean
  currentTime: string
  tempFileName: string
}
