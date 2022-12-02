// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface UpdateAudioSourceTypes {
  src: string
}

interface PlayerTypes {
  audio: HTMLAudioElement | null
  localVideo: HTMLVideoElement | null
  remoteVideo: HTMLVideoElement | null
}

interface PlayAudioTypes {
  loop?: boolean
}

const defaultState: PlayerTypes = {
  audio: null,
  localVideo: null,
  remoteVideo: null,
}

export const player = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updatePlayer: (state, payload: PlayerTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
    updateAudioSource: (state, payload: UpdateAudioSourceTypes) => {
      if (state.audio) {
        state.audio.src = `data:audio/ogg;base64, ${payload.src}`
      }
      return state
    },
    playAudio: (state, payload: PlayAudioTypes | undefined = { loop: false }) => {
      if (state.audio) {
        if (payload && payload.loop) state.audio.loop = true
        state.audio.play()
      }
    },
    stopAudio: (state) => {
      if (state.audio) {
        state.audio.pause()
        state.audio.currentTime = 0
      }
    },
    reset: () => {
      return defaultState
    },
  },
})
