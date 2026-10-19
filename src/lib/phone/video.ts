// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'
import Janus from '../webrtc/janus'
import { eventDispatch } from '../../utils'

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

/**
 * True when the SDP declines the video stream (m=video with port 0)
 */
export function sdpDeclinesVideo(sdp: string | undefined): boolean {
  return typeof sdp === 'string' && /^m=video 0 /m.test(sdp)
}

/**
 * Stops the local camera and brings the island back to an audio call: used when the
 * remote party, or Asterisk on its behalf, declines the video stream
 */
export function releaseLocalVideo() {
  const { localVideoStream, sipcall }: { localVideoStream: MediaStream | null; sipcall: any } =
    store.getState().webrtc
  if (localVideoStream) {
    // @ts-ignore
    Janus.stopAllTracks(localVideoStream)
  }
  store.dispatch.webrtc.updateLocalVideoStream(null)
  const senders: RTCRtpSender[] = sipcall?.webrtcStuff?.pc?.getSenders?.() ?? []
  senders.forEach((sender) => {
    if (sender.track?.kind === 'video') {
      sender.track.stop()
      sender.replaceTrack(null).catch(() => {})
    }
  })
  store.dispatch.currentCall.updateCurrentCall({ isLocalVideoEnabled: false })
  if (store.getState().island.view === 'video') {
    store.dispatch.island.setIslandView('call')
  }
  eventDispatch('phone-island-video-disabled', {})
}
