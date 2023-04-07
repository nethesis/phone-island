// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { eventDispatch } from '../utils'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { useEventListener } from '../utils'
import { playAnnouncement, playCallRecording } from '../lib/player/audio'

export const PlayerEvents: FC = () => {
  /**
   * Event listner for phone-island-audio-player-start event
   */
  useEventListener('phone-island-audio-player-start', (data: PlayerStartTypes) => {
    if (data.type) {
      // Check the id required when a type is provided
      if (!data.id) {
        console.error('phone-island-audio-player-start: when a type is provided, the id is required')
        return
      }
      // Manage types
      if (data.type === 'announcement') {
        playAnnouncement(data.id)
      } else if (data.type === 'call_recording') {
        playCallRecording(data.id)
      }
    } else {

    }
  })

  return <></>
}

interface PlayerStartTypes {
  base64_audio_file?: string
  type?: 'announcement' | 'call_recording'
  id?: string
}
