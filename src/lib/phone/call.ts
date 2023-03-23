// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getSupportedDevices } from '../devices/devices'
import Janus from '../webrtc/janus'
import {
  call,
  hangup,
  decline,
  answerWebRTC,
  muteWebRTC,
  unmuteWebRTC,
  pauseWebRTC,
  unpauseWebRTC,
} from '../webrtc/messages'
import { store } from '../../store'
import { isWebRTC } from '../user/default_device'

/**
 * Starts a call to a number
 * @param number The number string
 */
export function callNumber(number: string) {
  const BASE_HOST_URL: string = '127.0.0.1'
  const sipURI = `sip:${number}@${BASE_HOST_URL}`
  callSipURI(sipURI)
}

/**
 * Starts a call to a SIP URI
 *
 * @param sipURI The SIP URI string
 */
export function callSipURI(sipURI: string) {
  getSupportedDevices(async () => {
    // @ts-ignore
    Janus.log('This is a SIP call')
    await call(sipURI, {
      audio: {
        mandatory: {
          echoCancellation: false,
          googEchoCancellation: false,
          googAutoGainControl: false,
          googAutoGainControl2: false,
          googNoiseSuppression: false,
          googHighpassFilter: false,
          googTypingNoiseDetection: false,
        },
      },
      audioSend: true,
      audioRecv: true,
      videoSend: false,
      videoRecv: false,
    })
  })
}

/**
 * Answer incoming call
 */
export function answerIncomingCall() {
  if (isWebRTC()) {
    answerWebRTC()
  }
}

/**
 * Hangup current call
 */
export function hangupCurrentCall() {
  const { outgoing, accepted } = store.getState().currentCall
  if (outgoing || accepted) {
    hangup()
  } else {
    decline()
  }
  store.dispatch.player.stopAudioPlayer()
  store.dispatch.currentCall.reset()
}

/**
 * Mute the current call
 */
export function muteCurrentCall() {
  // Check the current user default device
  if (isWebRTC()) {
    const muted = muteWebRTC()
    if (muted) {
      store.dispatch.currentCall.updateCurrentCall({
        muted: true,
      })
    }
  }
}

/**
 * Unmute the current call
 */
export function unmuteCurrentCall() {
  // Check the current user default device
  if (isWebRTC()) {
    const unmuted = unmuteWebRTC()
    if (unmuted) {
      store.dispatch.currentCall.updateCurrentCall({
        muted: false,
      })
    }
  }
}

/**
 * Pause the current call
 */
export function pauseCurrentCall() {
  // Check the current user default device
  if (isWebRTC()) {
    const paused = pauseWebRTC()
    if (paused) {
      store.dispatch.currentCall.updateCurrentCall({
        paused: true,
      })
    }
  }
}

/**
 * Unpause the current call
 */
export function unpauseCurrentCall() {
  // Check the current user default device
  if (isWebRTC()) {
    const unpaused = unpauseWebRTC()
    if (unpaused) {
      store.dispatch.currentCall.updateCurrentCall({
        paused: false,
      })
    }
  }
}
