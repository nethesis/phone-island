// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import { updateLocalAudioSource } from '../lib/phone/audio'

interface UpdateAudioSourceTypes {
  src: string
}

interface PlayerTypes {
  localAudio: HTMLAudioElement | null
  remoteAudio: HTMLAudioElement | null
  localVideo: HTMLVideoElement | null
  remoteVideo: HTMLVideoElement | null
}

interface PlayAudioTypes {
  loop?: boolean
}

const defaultState: PlayerTypes = {
  localAudio: null,
  remoteAudio: null,
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
    updateLocalAudio: (state, payload: UpdateAudioSourceTypes) => {
      if (state.localAudio) {
        state.localAudio.src = `data:audio/ogg;base64, ${payload.src}`
      }
      return state
    },
    playLocalAudio: (state, payload: PlayAudioTypes | undefined = { loop: false }) => {
      if (state.localAudio) {
        if (payload && payload.loop) state.localAudio.loop = true
        // Check if is playing
        if (!state.localAudio.paused) {
          state.localAudio.pause()
          state.localAudio.currentTime = 0
        }
        state.localAudio.play()
      }
    },
    stopAudio: (state) => {
      if (state.localAudio) {
        state.localAudio.pause()
        state.localAudio.currentTime = 0
      }
    },
    reset: () => {
      return defaultState
    },
  },
  effects: (dispatch) => ({
    updateAndPlayLocalAudio: async (audioSource) => {
      // Update the audio source
      await updateLocalAudioSource({
        src: audioSource,
      })
      // Play the outgoing ringtone when ready
      dispatch.player.playLocalAudio({
        loop: true,
      })
    },
  }),
})
