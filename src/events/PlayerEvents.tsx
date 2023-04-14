// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { eventDispatch } from '../utils'
import { useEventListener } from '../utils'
import {
  playAnnouncement,
  playCallRecording,
  getRecordingName,
  getAnnouncementName,
} from '../lib/player/audio'
import { type PlayerStartTypes } from '../types'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'

export const PlayerEvents: FC = () => {
  const dispatch = useDispatch<Dispatch>()

  /**
   * Event listner for phone-island-audio-player-start event
   */
  useEventListener('phone-island-audio-player-start', (data: PlayerStartTypes) => {
    if (data.type) {
      // Check the id required when a type is provided
      if (!data.id) {
        console.error(
          'phone-island-audio-player-start: when a type is provided, the id is required',
        )
        return
      }
      // Manage types
      if (data.type === 'announcement') {
        getAnnouncementName(data.id)
        playAnnouncement(data.id)
      } else if (data.type === 'call_recording') {
        getRecordingName(data.id)
        playCallRecording(data.id)
      }
    } else {
      if (data.base64_audio_file) {
        // Play the base64 audio file
        dispatch.island.setIslandView('player')
        dispatch.player.resetAudioPlayerType()
        dispatch.player.updateAndPlayAudioPlayer({
          src: data.base64_audio_file,
        })
      }
      if (data.description) {
        dispatch.player.setAudioPlayerTrackName(data.description)
      }
    }
  })

  return <></>
}

/**
 * Dispatch call start
 */
export function dispatchAudioPlayerStarted() {
  eventDispatch('phone-island-audio-player-started', {})
}
