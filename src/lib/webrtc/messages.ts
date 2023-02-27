// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Janus from './janus'
import { store } from '../../store'

export function register(sipExten: string, sipSecret: string) {
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  const { name } = store.getState().currentUser
  if (sipcall) {
    sipcall.send({
      message: {
        request: 'register',
        username: 'sip:' + sipExten + '@' + '127.0.0.1',
        display_name: name || '',
        secret: sipSecret,
        proxy: 'sip:' + '127.0.0.1' + ':5060',
        sips: false,
        refresh: false,
      },
    })
  }
}

export function answerWebRTC() {
  const { sipcall, jsepGlobal }: { sipcall: any; jsepGlobal: any } = store.getState().webrtc
  if (sipcall && jsepGlobal) {
    sipcall.createAnswer({
      jsep: jsepGlobal,
      media: {
        audio: true,
        videoSend: false,
        videoRecv: false,
      },
      success: (jsep) => {
        sipcall.send({
          message: {
            request: 'accept',
          },
          jsep: jsep,
        })
      },
      error: (error) => {
        // @ts-ignore
        Janus.error('WebRTC error:', error)
        sipcall.send({
          message: {
            request: 'decline',
            code: 480,
          },
        })
      },
    })
  }
}

export function decline() {
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  if (sipcall) {
    sipcall.send({
      message: {
        request: 'decline',
      },
    })
  }
}

export function hangup() {
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  if (sipcall) {
    sipcall.send({
      message: {
        request: 'hangup',
      },
    })
  }
}

export function unregister() {
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  if (sipcall) {
    sipcall.send({
      message: {
        request: 'unregister',
      },
    })
  }
}

export function handleRemote(jsep) {
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  if (sipcall) {
    sipcall.handleRemoteJsep({
      jsep: jsep,
      error: function () {
        var hangup = {
          request: 'hangup',
        }
        sipcall.send({
          message: hangup,
        })
        sipcall.hangup()
      },
    })
  }
}

export function call(sipURI: string, mediaObj: object) {
  return new Promise((resolve, reject) => {
    const { sipcall }: { sipcall: any } = store.getState().webrtc
    if (sipURI && mediaObj) {
      sipcall.createOffer({
        media: mediaObj,
        success: function (jsep: any) {
          // @ts-ignore
          Janus.debug('Got SDP!')
          // @ts-ignore
          Janus.debug(jsep)
          sipcall.send({
            message: {
              request: 'call',
              uri: sipURI,
            },
            jsep: jsep,
          })
          resolve(true)
        },
        error: function (error) {
          // @ts-ignore
          Janus.error('ebRTC error...', error)
          // @ts-ignore
          Janus.error('WebRTC error call on createOffer: ', error)
          reject(false)
        },
      })
    }
  })
}

/**
 * Mute current call so the counterpart can't listen the current user
 * @returns The muted status
 */
export function muteWebRTC(): boolean {
  // Initialize sipcall
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  // Uset the janus library functions to mute call
  sipcall.muteAudio()
  return sipcall.isAudioMuted()
}

/**
 * Unmute current call so the counterpart can listen the current user
 * @returns The muted status
 */
export function unmuteWebRTC(): boolean {
  // Initialize sipcall
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  // Use the janus library functions to unmute call
  sipcall.unmuteAudio()
  return !sipcall.isAudioMuted()
}

/**
 * Pause current call so the counterpart listens the pause ringtone
 * @returns The true if no errors occurs
 */
export function pauseWebRTC() {
  // Initialize sipcall
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  // Send hold message
  try {
    sipcall.send({
      message: {
        request: 'hold',
      },
    })
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

/**
 * Unpause the current call so the counterpart listens the current user
 * @returns The true if no errors occurs
 */
export function unpauseWebRTC() {
  // Initialize sipcall
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  // Send hold message
  try {
    sipcall.send({
      message: {
        request: 'unhold',
      },
    })
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}
