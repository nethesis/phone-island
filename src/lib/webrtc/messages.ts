// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useWebRTCStore } from '../../utils/useWebRTCStore'
import Janus from './janus'

export const register = (sipExten: string, sipSecret: string) => {
  const { sipcall } = useWebRTCStore()
  if (sipcall) {
    sipcall.send({
      message: {
        request: 'register',
        username: 'sip:' + sipExten + '@' + '127.0.0.1',
        display_name: 'Foo 1',
        secret: sipSecret,
        proxy: 'sip:' + '127.0.0.1' + ':5060',
        sips: false,
        refresh: false,
      },
    })
  }
}

export const answer = () => {
  const { sipcall, jsepGlobal } = useWebRTCStore()
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

export const decline = () => {
  const { sipcall } = useWebRTCStore()
  sipcall.send({
    message: {
      request: 'decline',
    },
  })
}

export const hangup = () => {
  const { sipcall } = useWebRTCStore()
  sipcall.send({
    message: {
      request: 'hangup',
    },
  })
}

export const unregister = () => {
  const { sipcall } = useWebRTCStore()
  sipcall.send({
    message: {
      request: 'unregister',
    },
  })
}

export const handleRemote = function (jsep) {
  const { sipcall } = useWebRTCStore()
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
