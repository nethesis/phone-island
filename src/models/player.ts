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
  largeRemoteVideo: null,
  smallRemoteVideo: null,
  localScreen: null,
  remoteScreen: null,
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
        
        // Reset audio output device to default to avoid affecting other sounds
        if (typeof (state.audioPlayer.current as any).setSinkId === 'function') {
          (state.audioPlayer.current as any).setSinkId('default').catch((err: any) => {
            console.warn('Failed to reset audio output device to default:', err)
          })
        }
        
        return {
          ...state,
          audioPlayerPlaying: false,
        }
      }
    },
    emergencyStopAudioPlayer: (state) => {
      // Emergency stop: force reset everything audio-related
      if (state.audioPlayer && state.audioPlayer.current) {
        try {
          state.audioPlayer.current.pause()
          state.audioPlayer.current.currentTime = 0
          state.audioPlayer.current.src = ''
          
          // Reset audio output device to default
          if (typeof (state.audioPlayer.current as any).setSinkId === 'function') {
            (state.audioPlayer.current as any).setSinkId('default').catch((err: any) => {
              console.warn('Failed to reset audio output device to default:', err)
            })
          }
        } catch (err) {
          console.error('Error in emergency stop audio player:', err)
        }
      }
      
      return {
        ...state,
        audioPlayerPlaying: false,
        audioPlayerPaused: false,
        audioPlayerLoop: false,
        audioPlayerTrackType: null,
        audioPlayerTrackName: null,
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
    // Set useRingtoneOutput=true only for incoming call ringtones and previews
    updateStartAudioPlayer: async (
      { src, loop = false, useRingtoneOutput = false }: { src: string; loop?: boolean; useRingtoneOutput?: boolean },
      rootState,
    ) => {
      dispatch.player.setAudioPlayerLoop(loop)

      // Apply ringtone output device ONLY when explicitly requested (incoming calls & previews)
      const ringtoneOutputDeviceId = useRingtoneOutput ? rootState.ringtones?.outputDeviceId : null
      if (
        ringtoneOutputDeviceId &&
        rootState.player.audioPlayer?.current &&
        typeof (rootState.player.audioPlayer.current as any).setSinkId === 'function'
      ) {
        try {
          await (rootState.player.audioPlayer.current as any).setSinkId(ringtoneOutputDeviceId)
          console.info('Ringtone output device applied:', ringtoneOutputDeviceId)
        } catch (err) {
          console.warn('Failed to set ringtone output device, trying fallback to default:', err)
          // Fallback to default device if the saved device is not available
          try {
            await (rootState.player.audioPlayer.current as any).setSinkId('default')
            console.info('Ringtone output fallback to default successful')
            // Update store to reflect the fallback
            dispatch.ringtones.setOutputDeviceId('default')
          } catch (fallbackErr) {
            console.error('Even default device failed for ringtone:', fallbackErr)
          }
        }
      }

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
  largeRemoteVideo?: RefObject<HTMLVideoElement> | null
  smallRemoteVideo?: RefObject<HTMLVideoElement> | null
  localScreen?: RefObject<HTMLVideoElement> | null
  remoteScreen?: RefObject<HTMLVideoElement> | null
}
