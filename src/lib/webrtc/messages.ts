// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useWebRTCStore, useCurrentUserStore } from '../../utils'
import Janus from './janus'

export function register(sipExten: string, sipSecret: string) {
  const { sipcall } = useWebRTCStore()
  const { name } = useCurrentUserStore()
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
  const { sipcall, jsepGlobal } = useWebRTCStore()
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
  const { sipcall } = useWebRTCStore()
  if (sipcall) {
    sipcall.send({
      message: {
        request: 'decline',
      },
    })
  }
}

export function hangup() {
  const { sipcall } = useWebRTCStore()
  if (sipcall) {
    sipcall.send({
      message: {
        request: 'hangup',
      },
    })
  }
}

export function unregister() {
  const { sipcall } = useWebRTCStore()
  if (sipcall) {
    sipcall.send({
      message: {
        request: 'unregister',
      },
    })
  }
}

export function handleRemote(jsep) {
  const { sipcall } = useWebRTCStore()
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
    const { sipcall } = useWebRTCStore()
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
 * Mute current call so the counterpart can't hear the user's audio stream
 * @returns The muted status
 */
export function muteWebRTC(): boolean {
  // Initialize sipcall
  const { sipcall } = useWebRTCStore()
  // Uset the janus library functions to mute call
  sipcall.muteAudio()
  return sipcall.isAudioMuted()
}

/**
 * Unmute current call so the counterpart can hear the user's audio stream
 * @returns The muted status
 */
export function unmuteWebRTC(): boolean {
  // Initialize sipcall
  const { sipcall } = useWebRTCStore()
  // Use the janus library functions to unmute call
  sipcall.unmuteAudio()
  return !sipcall.isAudioMuted()
}
