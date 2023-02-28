// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Manages the audio update action
 */
export async function updateAudioPlayerSource(payload) {
  return new Promise((resolve, reject) => {
    // The can play through callback
    function canPlayCb() {
      store.getState().player.audioPlayer?.removeEventListener('canplaythrough', canPlayCb)
      resolve(true)
    }
    try {
      // Add event listener of can play through
      store.getState().player.audioPlayer?.addEventListener('canplaythrough', canPlayCb)
      // Update the audio player source
      store.dispatch.player.updateAudioPlayer(payload)
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}
