// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getSupportedDevices } from '../devices/devices'
import outgoingRingtone from '../../static/outgoing_ringtone'
import { store } from '../../store'
import Janus from '../webrtc/janus'
import { call, hangup, decline, answer } from '../webrtc/messages'

/**
 * Starts a call
 *
 * @param sipURI The sip uri string
 */

export function callSipURI(sipURI: string) {
  getSupportedDevices(async () => {
    // @ts-ignore
    Janus.log('This is a SIP call')
    const calling = await call(sipURI, {
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

    if (calling) {
      store.dispatch.player.updateAudioSource({ src: outgoingRingtone })
      store.dispatch.player.playAudio({
        loop: true,
      })
      store.dispatch.currentCall.updateCurrentCall({
        outgoing: true,
      })
    }
  })
}

/**
 * Answer incoming call
 */
export function answerIncomingCall() {
  answer()
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
  store.dispatch.currentCall.reset()
  store.dispatch.player.stopAudio()
}
