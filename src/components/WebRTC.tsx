// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import adapter from 'webrtc-adapter'
import Janus from '../lib/webrtc/janus.js'
import { register, unregister, handleRemote } from '../lib/webrtc/messages'
import { useWebRTCStore } from '../utils/useWebRTCStore'
import { store } from '../store'
// import busyRingtone from '../static/busy_ringtone'

interface WebRTCProps {
  children: ReactNode
  sipExten: string
  sipSecret: string
  hostName: string
}

export const WebRTC: FC<WebRTCProps> = ({ hostName, sipExten, sipSecret, children }) => {
  const dispatch = useDispatch<Dispatch>()

  let registered = false

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    const setupDeps = () =>
      // @ts-ignore
      Janus.useDefaultDependencies({
        adapter,
      })

    var evtObservers = {
      registration_failed: [],
      registered: [],
      calling: [],
      incomingcall: [],
      accepted: [],
      hangup: [],
      gateway_down: [],
      error: [],
      progress: [],
      destroyed: [],
    }

    // Put it into a store in the next step
    let currentAudio: HTMLAudioElement | null = null

    const initWebRTC = () => {
      // @ts-ignore
      Janus.init({
        debug: 'all',
        dependencies: setupDeps(),
        callback: function () {
          // @ts-ignore
          const janus = new Janus({
            server: `https://${hostName}/janus`,
            success: () => {
              // @ts-ignore
              janus.attach({
                plugin: 'janus.plugin.sip',
                opaqueId: 'sebastian' + '_' + new Date().getTime(),
                success: function (pluginHandle) {
                  // Set sipcall to the store
                  dispatch.webrtc.updateWebRTC({
                    sipcall: pluginHandle,
                  })
                  // Register the extension to the server
                  register(sipExten, sipSecret)
                  if (pluginHandle) {
                    console.log(
                      'SIP plugin attached! (' + pluginHandle.getPlugin() + ', id = ' + ')',
                    )
                  }
                  // getSupportedDevices(function () {
                  //   resolve()
                  // })
                },
                error: function (error) {
                  console.error('  -- Error attaching plugin...')
                  console.error(error)
                  // reject()
                },
                consentDialog: function (on) {
                  console.log(`janus consentDialog (on: ${on})`)
                },
                webrtcState: function (on) {
                  console.log(
                    'Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now',
                  )
                },
                iceState: function (newState) {
                  const { sipcall } = useWebRTCStore()

                  if (sipcall) {
                    console.log(
                      `ICE state of PeerConnection of handle has changed to "${newState}"`,
                    )
                  }
                },
                mediaState: function (medium, on) {
                  console.log('Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium)
                },
                slowLink: function (uplink, count) {
                  if (uplink) {
                    console.warn(`SLOW link: several missing packets from janus (${count})`)
                  } else {
                    console.warn(`SLOW link: janus is not receiving all your packets (${count})`)
                  }
                },
                onmessage: function (msg, jsep) {
                  const { sipcall } = useWebRTCStore()

                  // @ts-ignore
                  Janus.debug(' ::: Got a message :::')
                  // @ts-ignore
                  Janus.debug(JSON.stringify(msg))
                  // Any error?
                  var error = msg['error']
                  if (error != null && error != undefined) {
                    if (!registered) {
                      // @ts-ignore
                      Janus.log('User is not registered')
                    } else {
                      // Reset status
                      sipcall.hangup()
                    }
                    for (var evt in evtObservers['error']) {
                      // @ts-ignore
                      evtObservers['error'][evt](msg, jsep)
                    }
                    return
                  }
                  var result = msg['result']
                  if (
                    result !== null &&
                    result !== undefined &&
                    result['event'] !== undefined &&
                    result['event'] !== null
                  ) {
                    // get event
                    var event = result['event']

                    // call all evt registered
                    for (var evt in evtObservers[event]) {
                      evtObservers[event][evt](msg, jsep)
                    }

                    //switch event
                    switch (event) {
                      case 'registration_failed':
                        // @ts-ignore
                        Janus.error(
                          'Registration failed: ' + result['code'] + ' ' + result['reason'],
                        )
                        return
                        break

                      case 'unregistered':
                        // @ts-ignore
                        Janus.log('Successfully un-registered as ' + result['username'] + '!')
                        // registered = false
                        break

                      case 'registered':
                        // @ts-ignore
                        Janus.log('Successfully registered as ' + result['username'] + '!')
                        if (!registered) {
                          registered = true
                        }
                        // lastActivity = new Date().getTime()
                        break

                      case 'registering':
                        // @ts-ignore
                        Janus.log('janus registering')
                        break

                      case 'calling':
                        // @ts-ignore
                        Janus.log('Waiting for the peer to answer...')
                        // lastActivity = new Date().getTime()
                        break

                      case 'incomingcall':
                        dispatch.webrtc.updateWebRTC({ jsepGlobal: jsep })
                        // @ts-ignore
                        Janus.log('Incoming call from ' + result['username'] + '!')
                        // lastActivity = new Date().getTime()
                        break

                      case 'progress':
                        // @ts-ignore
                        Janus.log(
                          "There's early media from " +
                            result['username'] +
                            ', wairing for the call!',
                        )
                        if (jsep !== null && jsep !== undefined) {
                          handleRemote(jsep)
                        }
                        // lastActivity = new Date().getTime()
                        break

                      case 'accepted':
                        // @ts-ignore
                        Janus.log(result['username'] + ' accepted the call!')
                        if (jsep !== null && jsep !== undefined) {
                          handleRemote(jsep)
                        }
                        // lastActivity = new Date().getTime()
                        break

                      case 'hangup':
                        dispatch.player.stopAudio()
                        dispatch.currentCall.reset()
                        sipcall.hangup()
                        // if (
                        //   result['code'] === 486 &&
                        //   result['event'] === 'hangup' &&
                        //   result['reason'] === 'Busy Here'
                        // ) {
                        //   dispatch.player.updateAudioSource({
                        //     src: busyRingtone,
                        //   })
                        //   dispatch.player.playAudio()
                        // }
                        // @ts-ignore
                        Janus.log('Call hung up (' + result['code'] + ' ' + result['reason'] + ')!')
                        // lastActivity = new Date().getTime()
                        // stopScreenSharingI()
                        break

                      default:
                        break
                    }
                  }
                },
                onlocalstream: function (stream) {
                  const localVideoElement = store.getState().player.localVideo

                  // @ts-ignore
                  Janus.debug(' ::: Got a local stream :::')
                  // @ts-ignore
                  Janus.debug(stream)
                  // @ts-ignore
                  Janus.attachMediaStream(localVideoElement, stream)
                  /* IS VIDEO ENABLED ? */
                  // var videoTracks = stream.getVideoTracks()
                  /* */
                },
                onremotestream: function (stream) {
                  const audioElement = store.getState().player.audio
                  const remoteVideoElement = store.getState().player.remoteVideo

                  // @ts-ignore
                  Janus.debug(' ::: Got a remote stream :::')
                  // @ts-ignore
                  Janus.debug(stream)
                  // retrieve stream track
                  const audioTracks = stream.getAudioTracks()
                  const videoTracks = stream.getVideoTracks()

                  store.dispatch.player.stopAudio()

                  // @ts-ignore
                  Janus.attachMediaStream(audioElement, new MediaStream(audioTracks))

                  // @ts-ignore
                  Janus.attachMediaStream(remoteVideoElement, new MediaStream(videoTracks))
                },
                oncleanup: function () {
                  console.log(' ::: janus Got a cleanup notification :::')
                },
                detached: function () {
                  console.warn('SIP plugin handle detached from the plugin itself')
                },
              })
            },
            error: (err) => {
              console.log('error', err)
            },
          })
        },
      })
    }

    initWebRTC()

    return () => {
      unregister()
    }
  }, [])

  return <>{children}</>
}
