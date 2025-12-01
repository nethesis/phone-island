// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { isWebrtcTotallyFree } from './extension'
import { store } from '../../store'

/**
 * Checks the activity of webrtc and calls an action when is time to update it
 *
 * @param cb The callback to call when the extensions is free
 */
export function webrtcCheck(cb: () => void) {
  // Retrieve the current timestamp
  var now = new Date().getTime()
  // Get lastActivity from the webrtc store
  const { lastActivity, INACTIVE_DEADLINE_TIME } = store.getState().webrtc
  // Retrieve the time from the last webrtc activity
  const timeFromLastActivity = lastActivity ? now - lastActivity : now
  if (timeFromLastActivity > INACTIVE_DEADLINE_TIME && isWebrtcTotallyFree()) {
    console.warn(
      '[WEBRTC-CHECK] ⚠️ Janus inactive for ' +
        Math.round(timeFromLastActivity / 1000) +
        ' sec (> deadline: ' +
        INACTIVE_DEADLINE_TIME / 1000 +
        '): CALLING REGISTER CALLBACK',
    )
    // Call the callback action
    cb()
  } else if (timeFromLastActivity > INACTIVE_DEADLINE_TIME && !isWebrtcTotallyFree()) {
    console.debug('[WEBRTC-CHECK] Janus is in conversation: no reactivation')
  } else {
    console.debug(
      '[WEBRTC-CHECK] Janus last activity detected ' +
        Math.round(timeFromLastActivity / 1000) +
        ' sec ago (< deadline: ' +
        INACTIVE_DEADLINE_TIME / 1000 +
        '): no reactivation',
    )
  }
}
