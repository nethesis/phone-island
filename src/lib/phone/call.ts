// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getSupportedDevices } from '../devices/devices'
import outgoingRingtone from '../../static/outgoing_ringtone'
import { store } from '../../store'
import Janus from '../webrtc/janus'

/**
 * Starts a call
 *
 * @param sipcall The sipcall object
 * @param sipURI The sip uri string
 */

export const call = (sipcall, sipURI: string) => {
  // Set Janus type
  const janus: any = Janus

  getSupportedDevices(() => {
    // janus.log('This is a SIP call')
    let mediaObj = {
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
    }

    sipcall.createOffer({
      media: mediaObj,
      success: function (jsep) {
        // janus.debug('Got SDP!')
        // janus.debug(jsep)
        // By default, you only pass the SIP URI to call as an
        // argument to a "call" request. Should you want the
        // SIP stack to add some custom headers to the INVITE,
        // you can do so by adding an additional "headers" object,
        // containing each of the headers as key-value, e.g.:
        //		var body = { request: "call", uri: $('#peer').val(),
        //			headers: {
        //				"My-Header": "value",
        //				"AnotherHeader": "another string"
        //			}
        //		};
        var body = {
          request: 'call',
          uri: sipURI,
        }
        // Note: you can also ask the plugin to negotiate SDES-SRTP, instead of the
        // default plain RTP, by adding a "srtp" attribute to the request. Valid
        // values are "sdes_optional" and "sdes_mandatory", e.g.:
        //		var body = { request: "call", uri: $('#peer').val(), srtp: "sdes_optional" };
        // "sdes_optional" will negotiate RTP/AVP and add a crypto line,
        // "sdes_mandatory" will set the protocol to RTP/SAVP instead.
        // Just beware that some endpoints will NOT accept an INVITE
        // with a crypto line in it if the protocol is not RTP/SAVP,
        // so if you want SDES use "sdes_optional" with care.
        sipcall.send({
          message: body,
          jsep: jsep,
        })

        // Play outgoing audio
        store.dispatch.player.updateAudioSource({
          src: outgoingRingtone,
        })
        store.dispatch.player.playAudio({
          loop: true
        })
      },
      error: function (error) {
        // janus.error('WebRTC error...', error)
        janus.error('WebRTC error call on createOffer: ', error)
      },
    })
  })
}
