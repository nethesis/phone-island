// Copyright (C) 2024 Nethesis S.r.l.
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
  audioPlayerPaused: false,
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
    updateAudioPlayerSrc: (state, payload: string) => {
      if (state.audioPlayer && state.audioPlayer.current) {
        state.audioPlayer.current.src = payload
      }
      return state
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
    pauseAudioPlayer: (state) => {
      if (state.audioPlayer && state.audioPlayer.current) {
        state.audioPlayer.current.pause()
        return {
          ...state,
          audioPlayerPaused: true,
          audioPlayerPlaying: false,
        }
      }
    },
    setAudioPlayerPaused: (state, payload: boolean) => {
      return {
        ...state,
        audioPlayerPaused: payload,
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
    setAudioPlayerPlaying: (state, payload: boolean) => ({
      ...state,
      audioPlayerPlaying: payload,
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
    setAudioPlayerCurrentTime: (state, payload: number) => {
      if (state.audioPlayer && state.audioPlayer.current) {
        state.audioPlayer.current.currentTime = payload
      }
    },
    reset: () => {
      return defaultState
    },
  },
  effects: (dispatch) => ({
    startAudioPlayer: (endedEventCallback: () => void, rootState) => {
      if (rootState.player.audioPlayer && rootState.player.audioPlayer.current) {
        // Check if is playing
        if (rootState.player.audioPlayerPlaying) {
          rootState.player.audioPlayer.current.pause()
          rootState.player.audioPlayer.current.currentTime = 0
        }
        const endedCallback = () => {
          dispatch.player.setAudioPlayerPlaying(false)
          rootState.player!.audioPlayer!.current!.removeEventListener('ended', endedCallback)
          endedEventCallback()
        }
        // Handle playing ended event
        rootState.player.audioPlayer.current.addEventListener('ended', endedCallback)
        // Play the audio
        rootState.player.audioPlayer.current.play()
        dispatch.player.setAudioPlayerPlaying(true)
        dispatch.player.setAudioPlayerPaused(false)
        // Dispatch the event
        if (rootState.island.view === 'player') {
          dispatchAudioPlayerStarted()
        }
      }
    },
    // This function is recommended for playing audio with base64 sources
    updateStartAudioPlayer: async ({ src, loop = false }: { src: string; loop?: boolean }) => {
      dispatch.player.setAudioPlayerLoop(loop)
      // Update the audio source
      await updateAudioPlayerSource(`data:audio/ogg;base64, ${src}`)
      // Play the outgoing ringtone when ready
      dispatch.player.startAudioPlayer(() => {})
    },
  }),
})

interface PlayerTypes {
  audioPlayer?: RefObject<HTMLAudioElement> | null
  audioPlayerPlaying?: boolean
  audioPlayerPaused?: boolean
  audioPlayerLoop?: boolean
  audioPlayerTrackType?: TypeTypes | null
  audioPlayerTrackName?: string | null
  audioPlayerTrackDuration?: number | null
  localAudio?: RefObject<HTMLAudioElement> | null
  remoteAudio?: RefObject<HTMLAudioElement> | null
  localVideo?: RefObject<HTMLVideoElement> | null
  remoteVideo?: RefObject<HTMLVideoElement> | null
  localScreen?: RefObject<HTMLVideoElement> | null
}
