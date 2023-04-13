// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: AudioBarsTypes = {
  audioElementContext: null,
  audioElementAnalyser: null,
  audioElementSource: null,
  isReady: false,
}

export const audioBars = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setAudioElementContext: (state, payload: AudioContext) => {
      return {
        ...state,
        audioElementContext: payload,
      }
    },
    setAudioElementAnalyser: (state, payload: AnalyserNode) => {
      return {
        ...state,
        audioElementAnalyser: payload,
      }
    },
    setAudioElementSource: (state, payload: ContextSourceType) => {
      return {
        ...state,
        audioElementSource: payload,
      }
    },
    setIsReady: (state, payload: boolean) => {
      return {
        ...state,
        isReady: payload,
      }
    },
  },
})

interface AudioBarsTypes {
  audioElementContext: AudioContext | null
  audioElementAnalyser: AnalyserNode | null
  audioElementSource: ContextSourceType | null
  isReady: boolean
}

export type ContextSourceType = MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null
