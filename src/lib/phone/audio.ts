// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Manages the audio update action
 */
export async function updateLocalAudioSource(payload) {
  return new Promise((resolve, reject) => {
    // Check if source is already loaded
    console.error(store.getState().player.localAudio?.src === payload.src)
    // The can play through callback
    function canPlayCb() {
      store.getState().player.localAudio?.removeEventListener('canplaythrough', canPlayCb)
      resolve(true)
    }
    try {
      // Add event listener of can play through
      store.getState().player.localAudio?.addEventListener('canplaythrough', canPlayCb)
      // Update the audio source
      store.dispatch.player.updateLocalAudio(payload)
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}
