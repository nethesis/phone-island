// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getAnnouncement } from '../../services/offhour'
import { getCallRecording } from '../../services/history_call'
import { store } from '../../store'

/**
 * Given an id plays an announcement
 */
export async function playAnnouncement(id: string) {
  if (id) {
    const audio_file: string = await getAnnouncement(id)
    if (audio_file) {
      store.dispatch.island.setIslandView('player')
      store.dispatch.player.setAudioPlayerType('announcement')
      store.dispatch.player.updateAndPlayAudioPlayer({
        src: audio_file,
      })
    }
  }
}

/**
 * Given an id plays a call recording
 */
export async function playCallRecording(id: string) {
  if (id) {
    const audio_file: string = await getCallRecording(id)
    if (audio_file) {
      store.dispatch.island.setIslandView('player')
      store.dispatch.player.setAudioPlayerType('call_recording')
      store.dispatch.player.updateAndPlayAudioPlayer({
        src: audio_file,
      })
    }
  }
}
