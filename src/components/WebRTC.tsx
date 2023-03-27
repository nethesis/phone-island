// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import adapter from 'webrtc-adapter'
import JanusLib from '../lib/webrtc/janus.js'
import type { JanusTypes } from '../types'
import { register, unregister, handleRemote } from '../lib/webrtc/messages'
import { store, type RootState } from '../store'
import { checkMediaPermissions } from '../lib/devices/devices'
import { hangupCurrentCall } from '../lib/phone/call'
import { webrtcCheck } from '../lib/webrtc/connection'
import outgoingRingtone from '../static/outgoing_ringtone'

interface WebRTCProps {
  children: ReactNode
  sipExten: string
  sipSecret: string
  hostName: string
}

const Janus: JanusTypes = JanusLib

export const WebRTC: FC<WebRTCProps> = ({ hostName, sipExten, sipSecret, children }) => {
  const dispatch = useDispatch<Dispatch>()

  // Initialize janus check interval id
  const janusCheckInterval = useRef<any>(null)

  // check audio and video permissions
  useEffect(() => {
    checkMediaPermissions()
  }, [])

  useEffect(() => {
    const setupDeps = () =>
      Janus.useDefaultDependencies({
        adapter,
      })

    function initWebRTC() {
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
                    if (pluginHandle) {
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
                    }
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
                    const { sipcall }: { sipcall: any } = store.getState().webrtc

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
                    const { sipcall }: { sipcall: any } = store.getState().webrtc

                    if (Janus.debug) {
                      Janus.debug(' ::: Got a message :::')
                      Janus.debug(JSON.stringify(msg))
                    }

                    // Handle errors in message
                    var error = msg['error']
                    if (error != null && error != undefined) {
                      if (!store.getState().webrtc.registered) {
                        if (Janus.log) Janus.log('User is not registered')
                      } else {
                        // Reset status
                        sipcall && sipcall.hangup()

                        // Stop the local audio element ringing
                        store.dispatch.player.stopAudioPlayer()
                      }
                      return
                    }
                    // Manage events
                    var result = msg['result']
                    if (
                      result !== null &&
                      result !== undefined &&
                      result['event'] !== undefined &&
                      result['event'] !== null
                    ) {
                      // get event
                      var event = result['event']

                      //switch event
                      switch (event) {
                        case 'registration_failed':
                          if (Janus.error)
                            Janus.error(
                              'Registration failed: ' + result['code'] + ' ' + result['reason'],
                            )
                          break

                        case 'unregistered':
                          if (Janus.log)
                            Janus.log('Successfully un-registered as ' + result['username'] + '!')
                          // registered = false
                          break

                        case 'registered':
                          if (Janus.log)
                            Janus.log('Successfully registered as ' + result['username'] + '!')
                          if (!store.getState().webrtc.registered) {
                            store.dispatch.webrtc.updateWebRTC({
                              registered: true,
                            })
                          }
                          // Update webrtc lastActivity time
                          dispatch.webrtc.updateLastActivity(new Date().getTime())
                          break

                        case 'registering':
                          if (Janus.log) Janus.log('janus registering')
                          break

                        // This event arrive on outgoing call start
                        case 'calling':
                          // Number and display name are updated inside socket
                          dispatch.currentCall.checkOutgoingUpdate({
                            outgoingWebRTC: true,
                          })

                          // Update webrtc last activity time
                          dispatch.webrtc.updateLastActivity(new Date().getTime())
                          break

                        // After an outgoing call start on 180 code, it means
                        // ...that the local outgoing ringtone must be player
                        case 'ringing':
                          const { audioPlayerPlaying } = store.getState().player

                          // Check if the local audio is already playing and start playing
                          if (!audioPlayerPlaying) {
                            // Update audio player and start playing
                            dispatch.player.updateAndPlayAudioPlayer({
                              src: outgoingRingtone,
                              loop: true,
                            })
                          }
                          // Update webrtc lastActivity time
                          dispatch.webrtc.updateLastActivity(new Date().getTime())
                          break

                        // After an outgoing call start on 183 code, it means
                        // ...that the outgoing ringtone arrives from the stream
                        // ...playing the local outgoing ringtone isn't needed
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
                          // Update webrtc lastActivity time
                          dispatch.webrtc.updateLastActivity(new Date().getTime())
                          break

                        case 'incomingcall':
                          dispatch.webrtc.updateWebRTC({ jsepGlobal: jsep })

                          // Number and display name are updated inside socket
                          dispatch.currentCall.checkIncomingUpdateAndPlay({
                            incomingWebRTC: true,
                          })

                          if (Janus.log) Janus.log('Incoming call from ' + result['username'] + '!')
                          // Update the webrtc last activity time
                          dispatch.webrtc.updateLastActivity(new Date().getTime())
                          break

                        case 'accepted':
                          if (Janus.log) Janus.log(result['username'] + ' accepted the call!')
                          if (jsep) {
                            handleRemote(jsep)
                          }
                          // Set current call accepted
                          dispatch.currentCall.checkAcceptedUpdate({
                            acceptedWebRTC: true,
                          })

                          // Stop the local audio element ringing
                          store.dispatch.player.stopAudioPlayer()

                          // Update webrtc lastActivity time
                          dispatch.webrtc.updateLastActivity(new Date().getTime())
                          break

                        case 'hangup':
                          hangupCurrentCall()
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
                          // Update webrtc lastActivity time
                          dispatch.webrtc.updateLastActivity(new Date().getTime())
                          // stopScreenSharingI()
                          break

                        default:
                          break
                      }
                    }
                  },
                  onlocalstream: function (stream) {
                    // const localVideoElement = store.getState().player.localVideo
                    if (Janus.debug) {
                      Janus.debug(' ::: Got a local stream :::')
                      Janus.debug(stream)
                    }
                    // if (Janus.attachMediaStream) Janus.attachMediaStream(localVideoElement, stream)
                    /* IS VIDEO ENABLED ? */
                    // var videoTracks = stream.getVideoTracks()
                    /* */
                  },
                  onremotestream: function (stream: MediaStream) {
                    if (Janus.debug) {
                      Janus.debug(' ::: Got a remote stream :::')
                    }
                    // Stop the local audio element ringing
                    store.dispatch.player.stopAudioPlayer()

                    // Get remote audio and video elements
                    const remoteAudioElement = store.getState().player.remoteAudio
                    const remoteVideoElement = store.getState().player.remoteVideo

                    // Get audio and video from stream
                    const audioTracks: MediaStreamTrack[] = stream.getAudioTracks()
                    const videoTracks: MediaStreamTrack[] = stream.getVideoTracks()

                    if (Janus.attachMediaStream) {
                      // Initialize the new media stream for remote audio
                      if (audioTracks && audioTracks.length > 0) {
                        const audioStream: MediaStream = new MediaStream(audioTracks)
                        Janus.attachMediaStream(remoteAudioElement, audioStream)

                        // Save the new audio stream to the store
                        store.dispatch.webrtc.updateRemoteAudioStream(audioStream)
                      } else {
                        console.warn('No audio tracks on remote stream')
                      }
                      // Initialize the new media stream for remote video
                      if (videoTracks && videoTracks.length > 0) {
                        const videoStream: MediaStream = new MediaStream(videoTracks)
                        Janus.attachMediaStream(remoteVideoElement, videoStream)
                      } else {
                        console.warn('No video tracks on remote stream')
                      }
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
            error: (err: any) => {
              if (Janus.log) Janus.log('error', err)
              // Activate webrtc connection alert
              dispatch.alerts.setAlert('webrtc_down')
            },
            destroyed: () => {
              // Set webrtc destroyed status
              dispatch.webrtc.updateWebRTC({
                destroyed: true,
              })
              // Activate webrtc connection alert
              dispatch.alerts.setAlert('webrtc_down')
            },
          })
        },
      })
    }

    // Initializes the webrtc registration check interval
    function startWebrtcCheck() {
      const { CHECK_INTERVAL_TIME } = store.getState().webrtc
      if (!janusCheckInterval.current) {
        // Initialize the interval that check the webrtc
        janusCheckInterval.current = setInterval(
          () =>
            webrtcCheck(() => {
              // Do the register as callback of webrtc check
              register(sipExten, sipSecret)
            }),
          CHECK_INTERVAL_TIME,
        )
      }
    }

    // Start webrtc initialization and handlers
    initWebRTC()
    // Start the check of webrtc activity
    startWebrtcCheck()

    return () => {
      // Unregister from janus
      unregister()
      // Stop Janus check interval
      clearInterval(janusCheckInterval.current)
    }
  }, [])

  return <>{children}</>
}
