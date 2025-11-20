// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Audio processing profiles for different use cases
 */

export type AudioProfile = 'high-quality' | 'balanced' | 'noisy-environment'

export interface AudioProcessingConfig {
  echoCancellation: boolean
  noiseSuppression: boolean
  autoGainControl: boolean
  googEchoCancellation: boolean
  googAutoGainControl: boolean
  googNoiseSuppression: boolean
  googHighpassFilter: boolean
  googTypingNoiseDetection: boolean
  googNoiseReduction: boolean
}

/**
 * High-quality audio profile - for professional use
 * Minimal processing to preserve audio fidelity and depth
 */
export const highQualityConfig: AudioProcessingConfig = {
  echoCancellation: true,
  noiseSuppression: false,
  autoGainControl: false,
  googEchoCancellation: true,
  googAutoGainControl: false,
  googNoiseSuppression: false,
  googHighpassFilter: false,
  googTypingNoiseDetection: false,
  googNoiseReduction: false,
}

/**
 * Balanced audio profile
 * Light processing for good quality with some background noise reduction
 */
export const balancedConfig: AudioProcessingConfig = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  googEchoCancellation: true,
  googAutoGainControl: true,
  googNoiseSuppression: true,
  googHighpassFilter: true,
  googTypingNoiseDetection: false,
  googNoiseReduction: false,
}

/**
 * Noisy environment profile
 * Aggressive processing for challenging audio environments
 */
export const noisyEnvironmentConfig: AudioProcessingConfig = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  googEchoCancellation: true,
  googAutoGainControl: true,
  googNoiseSuppression: true,
  googHighpassFilter: true,
  googTypingNoiseDetection: true,
  googNoiseReduction: true,
}

/**
 * Get audio processing configuration based on profile
 */
export function getAudioProcessingConfig(
  profile: AudioProfile = 'high-quality',
): AudioProcessingConfig {
  switch (profile) {
    case 'balanced':
      return balancedConfig
    case 'noisy-environment':
      return noisyEnvironmentConfig
    case 'high-quality':
    default:
      return highQualityConfig
  }
}
