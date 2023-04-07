// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getAnnouncement } from '../../services/offhour'
import { store } from '../../store'

/**
 * Given an id plays an announcement
 */
export async function playAnnouncement(id: string) {
  const audio_file: string = await getAnnouncement(id)
  store.dispatch.player.updateAndPlayAudioPlayer({
    src: audio_file,
  })
}

/**
 * Given an id plays a call recording
 */
export function playCallRecording(id: string) {}
