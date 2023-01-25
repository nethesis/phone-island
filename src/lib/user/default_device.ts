// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useCurrentUserStore } from '../../utils'

/**
 * Checks if the current device is webrtc
 */
export function isWebRTC() {
  const { default_device } = useCurrentUserStore()
  if (default_device?.type === 'webrtc') {
    return true
  }
  return false
}
