// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getWebrtcExtensions, getExtensionData } from '../user/extensions'

/**
 * Checks if user's webrtc extension hasn't any running conversation
 */
export function isWebrtcTotallyFree(): boolean {
  const webrtcExtension = getWebrtcExtensions()
  if (webrtcExtension && !Array.isArray(webrtcExtension) && webrtcExtension.id) {
    const extensionData = getExtensionData(webrtcExtension.id)
    if (
      extensionData &&
      extensionData.conversations &&
      Object.values(extensionData.conversations).length > 0
    )
      return false
  }
  return true
}
