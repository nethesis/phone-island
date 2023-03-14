// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import { updateAudioPlayerSource } from '../lib/phone/audio'

const defaultState: PlayerTypes = {
  audioPlayer: null,
  audioPlayerLoop: false,
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
    updateAudioPlayer: (state, payload: UpdateAudioSourceTypes) => {
      if (state.audioPlayer) {
        state.audioPlayer.src = `data:audio/ogg;base64, ${payload.src}`
      }
      return state
    },
    playAudioPlayer: (state) => {
      if (state.audioPlayer) {
        // Check if is playing
        if (!state.audioPlayer.paused) {
          state.audioPlayer.pause()
          state.audioPlayer.currentTime = 0
        }
        state.audioPlayer.play()
      }
    },
    stopAudioPlayer: (state) => {
      if (state.audioPlayer) {
        state.audioPlayer.pause()
        state.audioPlayer.currentTime = 0
      }
    },
    setAudioPlayerLoop: (state, payload: boolean) => ({
      ...state,
      audioPlayerLoop: payload,
    }),
    reset: () => {
      return defaultState
    },
  },
  effects: (dispatch) => ({
    // This function is recommended for playing audio
    updateAndPlayAudioPlayer: async ({ src, loop = false }: { src: string; loop?: boolean }) => {
      dispatch.player.setAudioPlayerLoop(loop)
      // Update the audio source
      await updateAudioPlayerSource({
        src: src,
      })
      // Play the outgoing ringtone when ready
      dispatch.player.playAudioPlayer()
    },
  }),
})

interface UpdateAudioSourceTypes {
  src: string
}

interface PlayerTypes {
  audioPlayer: HTMLAudioElement | null
  audioPlayerLoop?: boolean
  localAudio: HTMLAudioElement | null
  remoteAudio: HTMLAudioElement | null
  localVideo: HTMLVideoElement | null
  remoteVideo: HTMLVideoElement | null
}
