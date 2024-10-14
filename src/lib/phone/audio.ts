// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Manages the audio update action
 */
export async function updateAudioPlayerSource(payload: string) {
  return new Promise((resolve, reject) => {
    function canPlayCb() {
      store.getState().player.audioPlayer?.current?.removeEventListener('canplaythrough', canPlayCb)
      resolve(true)
    }
    function loadedMetadata() {
      const trackDuration = store.getState().player.audioPlayer?.current?.duration
      trackDuration && store.dispatch.player.updateAudioPlayerTrackDuration(trackDuration)
      store
        .getState()
        .player.audioPlayer?.current?.removeEventListener('loadedmetadata', loadedMetadata)
    }
    try {
      // Event handlers must be set before updating the audio source of the element
      // Add event listener for canplaythrough event
      store.getState().player.audioPlayer?.current?.addEventListener('canplaythrough', canPlayCb)
      // Add event listener for onloadedmetadata event
      store
        .getState()
        .player.audioPlayer?.current?.addEventListener('loadedmetadata', loadedMetadata)
      // Update the audio player source
      store.dispatch.player.updateAudioPlayerSrc(payload)
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}
