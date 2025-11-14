// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Janus from './janus'
import { getAudioProcessingConfig, type AudioProfile } from './audioConfig'

/**
 * Initialize Janus with audio configuration
 */
export function initializeJanusAudioConfig(profile: AudioProfile = 'high-quality') {
  const audioConfig = getAudioProcessingConfig(profile)

  if (Janus && typeof Janus === 'object') {
    ;(Janus as any).defaultAudioConfig = {
      audio: audioConfig,
      video: true,
    }
  }
}

/**
 * Set Janus audio configuration for a session
 */
export function setJanusAudioProfile(profile: AudioProfile) {
  const audioConfig = getAudioProcessingConfig(profile)

  if (Janus && typeof Janus === 'object') {
    ;(Janus as any).defaultAudioConfig = {
      audio: audioConfig,
      video: true,
    }
  }
}
