// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import { updateAudioPlayerSource } from '../lib/phone/audio'
import { dispatchAudioPlayerStarted } from '../events/PlayerEvents'
import { type TypeTypes } from '../types'

const defaultState: PlayerTypes = {
  audioPlayer: null,
  audioPlayerPlaying: false,
  audioPlayerLoop: false,
  audioPlayerTrackType: null,
  audioPlayerTrackName: null,
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
        // Play the audio
        state.audioPlayer.play()
        // Dispatch the event
        dispatchAudioPlayerStarted()
        return {
          ...state,
          audioPlayerPlaying: true,
        }
      }
    },
    stopAudioPlayer: (state) => {
      if (state.audioPlayer) {
        // Pause audio
        state.audioPlayer.pause()
        state.audioPlayer.currentTime = 0
        return {
          ...state,
          audioPlayerPlaying: false,
        }
      }
    },
    setAudioPlayerLoop: (state, payload: boolean) => ({
      ...state,
      audioPlayerLoop: payload,
    }),
    setAudioPlayerType: (state, payload: TypeTypes) => ({
      ...state,
      audioPlayerTrackType: payload,
    }),
    resetAudioPlayerType: (state) => ({
      ...state,
      audioPlayerTrackType: null,
    }),
    setAudioPlayerTrackName: (state, payload: string) => ({
      ...state,
      audioPlayerTrackName: payload,
    }),
    playRemoteAudio: (state) => {
      state.remoteAudio?.play()
    },
    pauseRemoteAudio: (state) => {
      state.remoteAudio?.pause()
    },
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
  audioPlayerPlaying?: boolean
  audioPlayerLoop?: boolean
  audioPlayerTrackType?: TypeTypes | null
  audioPlayerTrackName?: string | null
  localAudio: HTMLAudioElement | null
  remoteAudio: HTMLAudioElement | null
  localVideo: HTMLVideoElement | null
  remoteVideo: HTMLVideoElement | null
}
