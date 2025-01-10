// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Checks if the current device is webrtc
 */
export function isWebRTC() {
  const { default_device } = store.getState().currentUser
  if (default_device?.type === 'webrtc' || default_device?.type === 'nethlink') {
    return true
  }
  return false
}

export function isPhysical() {
  const { default_device } = store.getState().currentUser
  if (default_device?.type === 'physical') {
    return true
  }
  return false
}
