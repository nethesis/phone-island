// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Janus from './janus'
import { store } from '../../store'
import adapter from 'webrtc-adapter'
import { getCurrentAudioInputDeviceId, getSupportedDevices } from '../devices/devices'
import { getJSONItem } from '../../utils'
import { JanusTrack } from '../../types'

export function register({
  sipExten,
  sipSecret,
  sipHost,
  sipPort,
}: {
  sipExten: string
  sipSecret: string
  sipHost: string
  sipPort: string
}) {
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  const { name } = store.getState().currentUser
  if (sipcall) {
    sipcall.send({
      message: {
        request: 'register',
        username: `sip:${sipExten}@${sipHost}`,
        display_name: name || '',
        secret: sipSecret,
        proxy: `sip:${sipHost}:${sipPort}`,
        outbound_proxy: `sip:${sipHost}:${sipPort}`,
        sips: false,
        refresh: false,
      },
    })
  }
}

export function answerWebRTC() {
  const { sipcall, jsepGlobal }: { sipcall: any; jsepGlobal: any } = store.getState().webrtc
  if (sipcall && jsepGlobal) {
    let currentAudioInputDeviceId = getCurrentAudioInputDeviceId()
    const tracks: any[] = []

    if (currentAudioInputDeviceId) {
      tracks.push({
        type: 'audio',
        capture: { deviceId: { exact: currentAudioInputDeviceId } },
        recv: true,
      })
    } else {
      tracks.push({ type: 'audio', capture: true, recv: true })
    }

    sipcall.createAnswer({
      jsep: jsepGlobal,
      tracks: tracks,
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

export function detach() {
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  if (sipcall) {
    return sipcall.detach()
  }
}

export function handleRemote(jsep: any) {
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  if (sipcall) {
    sipcall.handleRemoteJsep({
      jsep: jsep,
      error: function (error) {
        console.error('WebRTC error... ' + JSON.stringify(error))

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

export function callSipURI(sipURI: string) {
  getSupportedDevices(async () => {
    // @ts-ignore
    Janus.log('This is a SIP call')

    let currentAudioInputDeviceId = getCurrentAudioInputDeviceId()

    const tracks: JanusTrack[] = []

    if (currentAudioInputDeviceId) {
      tracks.push({
        type: 'audio',
        capture: { deviceId: { exact: currentAudioInputDeviceId } },
        recv: true,
      })
    } else {
      tracks.push({ type: 'audio', capture: true, recv: true })
    }

    await call(sipURI, tracks)
  })
}

export function call(sipURI: string, tracks: JanusTrack[]) {
  return new Promise((resolve, reject) => {
    const { sipcall }: { sipcall: any } = store.getState().webrtc

    sipcall.createOffer({
      tracks: tracks,
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
        Janus.error('WebRTC error...', error)
        // @ts-ignore
        Janus.error('WebRTC error call on createOffer: ', error)
        reject(false)
      },
    })
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

/**
 * Send DTMF messages to Janus
 */
export function sendDTMF(key: string) {
  // Initialize sipcall
  const { sipcall }: { sipcall: any } = store.getState().webrtc
  if (adapter.browserDetails.browser === 'chrome') {
    sipcall.dtmf({
      dtmf: {
        tones: key,
      },
    })
  } else {
    sipcall.send({
      message: {
        request: 'dtmf_info',
        digit: `${key}`,
      },
    })
  }
}
