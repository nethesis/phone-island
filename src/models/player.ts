// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import { updateAudioPlayerSource } from '../lib/phone/audio'
import { dispatchAudioPlayerStarted } from '../events/PlayerEvents'
import { type TypeTypes } from '../types'
import { RefObject } from 'react'

const defaultState: PlayerTypes = {
  audioPlayer: null,
  audioPlayerPlaying: false,
  audioPlayerLoop: false,
  audioPlayerTrackType: null,
  audioPlayerTrackName: null,
  audioPlayerTrackDuration: null,
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
    updateAudioPlayerTrackDuration: (state, payload: number) => {
      return {
        ...state,
        audioPlayerTrackDuration: payload,
      }
    },
    updateAudioPlayer: (state, payload: UpdateAudioSourceTypes) => {
      if (state.audioPlayer && state.audioPlayer.current) {
        state.audioPlayer.current.src = `data:audio/ogg;base64, ${payload.src}`
      }
      return state
    },
    playAudioPlayer: (state) => {
      if (state.audioPlayer && state.audioPlayer.current) {
        // Check if is playing
        if (!state.audioPlayer.current.paused) {
          state.audioPlayer.current.pause()
          state.audioPlayer.current.currentTime = 0
        }
        // Play the audio
        state.audioPlayer.current.play()
        // Dispatch the event
        dispatchAudioPlayerStarted()
        return {
          ...state,
          audioPlayerPlaying: true,
        }
      }
    },
    stopAudioPlayer: (state) => {
      if (state.audioPlayer && state.audioPlayer.current) {
        // Pause audio
        state.audioPlayer.current.pause()
        state.audioPlayer.current.currentTime = 0
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
      state.remoteAudio && state.remoteAudio.current?.play()
    },
    pauseRemoteAudio: (state) => {
      state.remoteAudio && state.remoteAudio.current?.pause()
    },
    reset: () => {
      return defaultState
    },
  },
  effects: (dispatch) => ({
    // This function is recommended for playing audio
    updatePlayAudioPlayer: async ({ src, loop = false }: { src: string; loop?: boolean }) => {
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
  audioPlayer: RefObject<HTMLAudioElement> | null
  audioPlayerPlaying?: boolean
  audioPlayerLoop?: boolean
  audioPlayerTrackType?: TypeTypes | null
  audioPlayerTrackName?: string | null
  audioPlayerTrackDuration?: number | null
  localAudio: RefObject<HTMLAudioElement> | null
  remoteAudio: RefObject<HTMLAudioElement> | null
  localVideo: RefObject<HTMLVideoElement> | null
  remoteVideo: RefObject<HTMLVideoElement> | null
}
