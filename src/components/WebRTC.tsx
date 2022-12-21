// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import adapter from 'webrtc-adapter'
import JanusLib from '../lib/webrtc/janus.js'
import type { JanusTypes } from '../lib/webrtc/types'
import { register, unregister, handleRemote } from '../lib/webrtc/messages'
import { useWebRTCStore } from '../utils/useWebRTCStore'
import { store } from '../store'
import { checkMediaPermissions } from '../lib/devices/devices'
// import busyRingtone from '../static/busy_ringtone'

interface WebRTCProps {
  children: ReactNode
  sipExten: string
  sipSecret: string
  hostName: string
}

const Janus: JanusTypes = JanusLib

export const WebRTC: FC<WebRTCProps> = ({ hostName, sipExten, sipSecret, children }) => {
  const dispatch = useDispatch<Dispatch>()

  let registered = false

  // check audio and video permissions
  useEffect(() => {
    checkMediaPermissions()
  }, [])

  useEffect(() => {
    const setupDeps = () =>
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
      Janus.init({
        debug: 'all',
        dependencies: setupDeps(),
        callback: function () {
          const janusInstance = new Janus({
            server: `https://${hostName}/janus`,
            success: () => {
              if (janusInstance.attach) {
                // Use Janus Sip Plugin
                janusInstance.attach({
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
                      if (Janus.log)
                        Janus.log(
                          'SIP plugin attached! (' + pluginHandle.getPlugin() + ', id = ' + ')',
                        )
                    }
                    // getSupportedDevices(function () {
                    // resolve()
                    // })
                  },
                  error: function (error) {
                    if (Janus.error) {
                      Janus.error('  -- Error attaching plugin...')
                      Janus.error(error)
                    }
                    // reject()
                  },
                  consentDialog: function (on) {
                    if (Janus.log) Janus.log(`janus consentDialog (on: ${on})`)
                  },
                  webrtcState: function (on) {
                    if (Janus.log)
                      Janus.log(
                        'Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now',
                      )
                  },
                  iceState: function (newState) {
                    const { sipcall } = useWebRTCStore()

                    if (sipcall) {
                      if (Janus.log)
                        Janus.log(
                          `ICE state of PeerConnection of handle has changed to "${newState}"`,
                        )
                    }
                  },
                  mediaState: function (medium, on) {
                    if (Janus.log)
                      Janus.log(
                        'Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium,
                      )
                  },
                  slowLink: function (uplink, count) {
                    if (uplink) {
                      if (Janus.warn)
                        Janus.warn(`SLOW link: several missing packets from janus (${count})`)
                    } else {
                      if (Janus.warn)
                        Janus.warn(`SLOW link: janus is not receiving all your packets (${count})`)
                    }
                  },
                  onmessage: function (msg, jsep) {
                    const { sipcall } = useWebRTCStore()

                    if (Janus.debug) {
                      Janus.debug(' ::: Got a message :::')
                      Janus.debug(JSON.stringify(msg))
                    }

                    var error = msg['error']
                    if (error != null && error != undefined) {
                      if (!registered) {
                        if (Janus.log) Janus.log('User is not registered')
                      } else {
                        // Reset status
                        sipcall.hangup()
                      }
                      for (var evt in evtObservers['error']) {
                        // evtObservers['error'][evt](msg, jsep)
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
                          if (Janus.error)
                            Janus.error(
                              'Registration failed: ' + result['code'] + ' ' + result['reason'],
                            )
                          return
                          break

                        case 'unregistered':
                          if (Janus.log)
                            Janus.log('Successfully un-registered as ' + result['username'] + '!')
                          // registered = false
                          break

                        case 'registered':
                          if (Janus.log)
                            Janus.log('Successfully registered as ' + result['username'] + '!')
                          if (!registered) {
                            registered = true
                          }
                          // lastActivity = new Date().getTime()
                          break

                        case 'registering':
                          if (Janus.log) Janus.log('janus registering')
                          break

                        case 'calling':
                          if (Janus.log) Janus.log('Waiting for the peer to answer...')
                          // lastActivity = new Date().getTime()
                          break

                        case 'incomingcall':
                          dispatch.webrtc.updateWebRTC({ jsepGlobal: jsep })
                          if (Janus.log) Janus.log('Incoming call from ' + result['username'] + '!')
                          // lastActivity = new Date().getTime()
                          break

                        case 'progress':
                          if (Janus.log)
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
                          if (Janus.log) Janus.log(result['username'] + ' accepted the call!')
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
                          if (Janus.log)
                            Janus.log(
                              'Call hung up (' + result['code'] + ' ' + result['reason'] + ')!',
                            )
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

                    if (Janus.debug) {
                      Janus.debug(' ::: Got a local stream :::')
                      Janus.debug(stream)
                    }

                    if (Janus.attachMediaStream) Janus.attachMediaStream(localVideoElement, stream)
                    /* IS VIDEO ENABLED ? */
                    // var videoTracks = stream.getVideoTracks()
                    /* */
                  },
                  onremotestream: function (stream) {
                    const audioElement = store.getState().player.audio
                    const remoteVideoElement = store.getState().player.remoteVideo

                    if (Janus.debug) {
                      Janus.debug(' ::: Got a remote stream :::')
                      Janus.debug(stream)
                    }

                    // retrieve stream track
                    const audioTracks = stream.getAudioTracks()
                    const videoTracks = stream.getVideoTracks()

                    store.dispatch.player.stopAudio()

                    if (Janus.attachMediaStream) {
                      Janus.attachMediaStream(audioElement, new MediaStream(audioTracks))
                      Janus.attachMediaStream(remoteVideoElement, new MediaStream(videoTracks))
                    }
                  },
                  oncleanup: function () {
                    if (Janus.log) Janus.log(' ::: janus Got a cleanup notification :::')
                  },
                  detached: function () {
                    if (Janus.warn) Janus.warn('SIP plugin handle detached from the plugin itself')
                  },
                })
              }
            },
            error: (err) => {
              if (Janus.log) Janus.log('error', err)
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
