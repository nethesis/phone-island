// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface UpdateAudioSourceTypes {
  src: string
}

const audioElement: HTMLAudioElement = new Audio()
audioElement.loop = true

const defaultState = {
  audio: audioElement,
}

export const player = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateSource: (state, payload: UpdateAudioSourceTypes) => {
      state.audio.src = `data:audio/ogg;base64, ${payload.src}`
      return state
    },
    play: (state) => {
      state.audio.play()
    },
    stop: (state) => {
      state.audio.pause()
      state.audio.currentTime = 0
    },
    reset: () => {
      return defaultState
    },
  },
})
