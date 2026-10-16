// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Tells the peer (through the websocket) that a video call started, so that
 * a WebRTC peer opens its video view
 */
export function notifyPeerVideoStart() {
  const { socket } = store.getState().websocket
  const { username: destUser } = store.getState().currentCall
  const { username: callUser } = store.getState().currentUser

  if (!socket || !destUser || !callUser) {
    return
  }

  socket.emit('message', {
    message: 'videoCallStart',
    destUser,
    callUser,
  })
}

/**
 * True when the SDP answer carries an active video stream
 */
export function sdpHasActiveVideo(sdp: string | undefined): boolean {
  if (typeof sdp !== 'string') {
    return false
  }
  return /^m=video (?!0 )/m.test(sdp)
}
