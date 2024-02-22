// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import adapter from 'webrtc-adapter'
import JanusLib from '../lib/webrtc/janus.js'
import type { JanusTypes } from '../types'
import { register, unregister, handleRemote } from '../lib/webrtc/messages'
import { store } from '../store'
import { checkMediaPermissions } from '../lib/devices/devices'
import { attendedTransfer, hangupCurrentCall } from '../lib/phone/call'
import { webrtcCheck } from '../lib/webrtc/connection'
import outgoingRingtone from '../static/outgoing_ringtone'
import { eventDispatch, useEventListener } from '../utils'

interface WebRTCProps {
  children: ReactNode
  sipExten: string
  sipSecret: string
  hostName: string
  sipHost: string
  sipPort: string
  reload: boolean
  reloadedCallback?: () => void
}

export const WebRTC: FC<WebRTCProps> = ({
  hostName,
  sipExten,
  sipSecret,
  children,
  sipHost,
  sipPort,
  reload,
  reloadedCallback,
}) => {
  // Initialize store dispatch
  const dispatch = useDispatch<Dispatch>()

  // Initialize janus check interval id
  const janusCheckInterval = useRef<any>(null)

  // Initialize Janus from Janus library
  const janus = useRef<JanusTypes>(JanusLib)

  // Initializes the webrtc connection and handlers
  const initWebRTC = useCallback(() => {
    janus.current.init({
      debug: 'all',
      dependencies: janus.current.useDefaultDependencies({
        adapter,
      }),
      callback: function () {
        const janusInstance = new janus.current({
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
                    register({ sipExten, sipSecret, sipHost, sipPort })
                    if (pluginHandle) {
                      if (janus.current.log)
                        janus.current.log(
                          'SIP plugin attached! (' + pluginHandle.getPlugin() + ', id = ' + ')',
                        )
                    }
                  }
                },
                error: function (error) {
                  if (janus.current.error) {
                    janus.current.error('  -- Error attaching plugin...')
                    janus.current.error(error)
                  }
                  // reject()
                },
                consentDialog: function (on) {
                  if (janus.current.log) janus.current.log(`janus consentDialog (on: ${on})`)
                },
                webrtcState: function (on) {
                  if (janus.current.log)
                    janus.current.log(
                      'Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now',
                    )
                },
                iceState: function (newState) {
                  const { sipcall }: { sipcall: any } = store.getState().webrtc

                  if (sipcall) {
                    if (janus.current.log)
                      janus.current.log(
                        `ICE state of PeerConnection of handle has changed to "${newState}"`,
                      )
                  }
                },
                mediaState: function (medium, on) {
                  if (janus.current.log)
                    janus.current.log(
                      'Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium,
                    )
                },
                slowLink: function (uplink, count) {
                  if (uplink) {
                    if (janus.current.warn)
                      janus.current.warn(`SLOW link: several missing packets from janus (${count})`)
                  } else {
                    if (janus.current.warn)
                      janus.current.warn(
                        `SLOW link: janus is not receiving all your packets (${count})`,
                      )
                  }
                },
                onmessage: function (msg, jsep) {
                  // Get webrtc state
                  const { sipcall }: { sipcall: any } = store.getState().webrtc

                  if (janus.current.debug) {
                    janus.current.debug(' ::: Got a message :::')
                    janus.current.debug(JSON.stringify(msg))
                  }

                  // Handle errors in message
                  var error = msg['error']
                  if (error != null && error != undefined) {
                    if (!store.getState().webrtc.registered) {
                      if (janus.current.log) janus.current.log('User is not registered')
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
                    // Get event data
                    var event = result['event']
                    // Get the recording state
                    const { recording } = store.getState().recorder

                    // Manage different types of events
                    switch (event) {
                      case 'registration_failed':
                        if (janus.current.error)
                          janus.current.error(
                            'Registration failed: ' + result['code'] + ' ' + result['reason'],
                          )
                        break

                      case 'unregistered':
                        if (janus.current.log)
                          janus.current.log(
                            'Successfully un-registered as ' + result['username'] + '!',
                          )
                        break

                      case 'registered':
                        if (janus.current.log)
                          janus.current.log(
                            'Successfully registered as ' + result['username'] + '!',
                          )
                        if (!store.getState().webrtc.registered) {
                          store.dispatch.webrtc.updateWebRTC({
                            registered: true,
                          })
                        }
                        // Remove WebRTC connections alert if any
                        dispatch.alerts.removeAlert('webrtc_down')
                        // Update webrtc lastActivity time
                        dispatch.webrtc.updateLastActivity(new Date().getTime())
                        break

                      case 'registering':
                        if (janus.current.log) {
                          janus.current.log('janus registering')
                        }
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
                          dispatch.player.updateStartAudioPlayer({
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
                        if (janus.current.log) {
                          janus.current.log(
                            "There's early media from " +
                              result['username'] +
                              ', wairing for the call!',
                          )
                        }
                        // Set the remote description to janus lib
                        if (jsep) {
                          handleRemote(jsep)
                        }
                        // Update webrtc lastActivity time
                        dispatch.webrtc.updateLastActivity(new Date().getTime())
                        break

                      case 'incomingcall':
                        // Update webrtc state
                        dispatch.webrtc.updateWebRTC({ jsepGlobal: jsep })
                        // Check if is recording an audio through call
                        // ...recording an audio is a request made by the user
                        // ...it must be managed differently than an incoming call
                        if (recording) {
                          // Update the recorder state
                          dispatch.recorder.setIncoming(true)
                        } else {
                          // Manage the incoming message as a webrtc call
                          // Update incoming webrtc state, number and display name
                          // ...are updated inside socket
                          dispatch.currentCall.checkIncomingUpdatePlay({
                            incomingWebRTC: true,
                          })

                          if (janus.current.log) {
                            janus.current.log('Incoming call from ' + result['username'] + '!')
                          }
                        }

                        // Update the webrtc last activity time
                        dispatch.webrtc.updateLastActivity(new Date().getTime())
                        break

                      case 'accepted':
                        if (janus.current.log) {
                          janus.current.log(result['username'] + ' accepted the call!')
                        }
                        // Set the remote description to janus lib
                        if (jsep) {
                          handleRemote(jsep)
                        }
                        // Set current call accepted
                        dispatch.currentCall.checkAcceptedUpdate({
                          acceptedWebRTC: true,
                        })
                        // Set incoming value to false
                        dispatch.currentCall.updateCurrentCall({
                          incoming: false,
                          incomingWebRTC: false,
                        })

                        // Stop the local audio element ringing
                        store.dispatch.player.stopAudioPlayer()

                        // Update webrtc lastActivity time
                        dispatch.webrtc.updateLastActivity(new Date().getTime())
                        break

                      case 'hangup':
                        // Manage hangup message during recording
                        if (recording) {
                          dispatch.recorder.setRecording(false)
                        }

                        hangupCurrentCall()
                        sipcall.hangup()

                        // Stop the local audio element ringing
                        store.dispatch.player.stopAudioPlayer()

                        // Check the janus doc before enable the following
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
                        if (janus.current.log)
                          janus.current.log(
                            'Call hung up (' + result['code'] + ' ' + result['reason'] + ')!',
                          )
                        // Update webrtc lastActivity time
                        dispatch.webrtc.updateLastActivity(new Date().getTime())
                        // stopScreenSharingI()
                        break

                      case 'gateway_down':
                        console.warn('THE GATEWAY IS DOWN')

                        break

                      default:
                        break
                    }
                  }
                },
                onlocalstream: function (stream) {
                  // const localVideoElement = store.getState().player.localVideo
                  if (janus.current.debug) {
                    janus.current.debug(' ::: Got a local stream :::')
                    janus.current.debug(stream)
                  }

                  // Get local video element
                  const localVideoElement = store.getState().player.localVideo

                  // Get audio and video tracks from stream
                  const audioTracks: MediaStreamTrack[] = stream.getAudioTracks()
                  const videoTracks: MediaStreamTrack[] = stream.getVideoTracks()

                  if (janus.current.attachMediaStream) {
                    // Initialize the new media stream for local audio
                    if (audioTracks && audioTracks.length > 0) {
                      const audioStream: MediaStream = new MediaStream(audioTracks)

                      // Save the new audio stream to the store
                      store.dispatch.webrtc.updateLocalAudioStream(audioStream)
                    } else {
                      console.warn('No audio tracks on local stream')
                    }
                    // Initialize the new media stream for local video
                    if (videoTracks && videoTracks.length > 0) {
                      const videoStream: MediaStream = new MediaStream(videoTracks)

                      if (localVideoElement && localVideoElement.current) {
                        janus.current.attachMediaStream(localVideoElement.current, videoStream)
                      }
                    } else {
                      console.warn('No video tracks on local stream')
                    }
                  }
                },
                onremotestream: function (stream: MediaStream) {
                  if (janus.current.debug) {
                    janus.current.debug(' ::: Got a remote stream :::')
                  }
                  // Stop the local audio element ringing
                  store.dispatch.player.stopAudioPlayer()

                  // Get remote audio and video elements
                  const remoteAudioElement = store.getState().player.remoteAudio
                  const remoteVideoElement = store.getState().player.remoteVideo

                  // Get audio and video from stream
                  const audioTracks: MediaStreamTrack[] = stream.getAudioTracks()
                  const videoTracks: MediaStreamTrack[] = stream.getVideoTracks()

                  if (janus.current.attachMediaStream) {
                    // Initialize the new media stream for remote audio
                    if (audioTracks && audioTracks.length > 0) {
                      const audioStream: MediaStream = new MediaStream(audioTracks)

                      if (remoteAudioElement && remoteAudioElement.current) {
                        janus.current.attachMediaStream(remoteAudioElement.current, audioStream)
                      }
                      // Save the new audio stream to the store
                      store.dispatch.webrtc.updateRemoteAudioStream(audioStream)
                    } else {
                      console.warn('No audio tracks on remote stream')
                    }
                    // Initialize the new media stream for remote video
                    if (videoTracks && videoTracks.length > 0) {
                      const videoStream: MediaStream = new MediaStream(videoTracks)

                      if (remoteVideoElement && remoteVideoElement.current) {
                        janus.current.attachMediaStream(remoteVideoElement.current, videoStream)
                      }
                    } else {
                      console.warn('No video tracks on remote stream')
                    }
                  }
                },
                oncleanup: function () {
                  if (janus.current.log) {
                    janus.current.log(' ::: janus Got a cleanup notification :::')
                  }
                },
                detached: function () {
                  if (janus.current.warn) {
                    janus.current.warn('SIP plugin handle detached from the plugin itself')
                  }
                },
              })
            }
          },
          error: (err: any) => {
            if (janus.current.log) janus.current.log('error', err)
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
  }, [janus.current])

  // Check audio and video permissions
  useEffect(() => {
    checkMediaPermissions()
  }, [])

  // Manage webrtc connections and events
  useEffect(() => {
    // Initializes the webrtc registration check interval
    function startWebrtcCheck() {
      const { CHECK_INTERVAL_TIME } = store.getState().webrtc
      if (!janusCheckInterval.current) {
        // Initialize the interval that check the webrtc
        janusCheckInterval.current = setInterval(
          () =>
            webrtcCheck(() => {
              // Do the register as callback of webrtc check
              register({ sipExten, sipSecret, sipHost, sipPort })
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

  // Manage reload events
  useEffect(() => {
    if (reload) {
      // Unregister the WebRTC extension
      unregister()
      // Detach sipcall
      const { sipcall }: { sipcall: any } = store.getState().webrtc
      if (sipcall) sipcall.detach()
      // Destroy Janus session
      if (janus.current.destroy) janus.current.destroy()
      // Initialize a new Janus session
      setTimeout(() => {
        initWebRTC()
        // Execute the reloaded callback
        if (reloadedCallback) reloadedCallback()
      }, 10000)
    }
  }, [reload])

  useEventListener('phone-island-attach', (data) => {
    initWebRTC()
    store.dispatch.currentUser.updateCurrentDefaultDevice(data?.deviceInformationObject)
    eventDispatch('phone-island-attached', {})
  })

  /**
   * Event listner for phone-island-call-transfer event
   */
  useEventListener('phone-island-call-transfer', (data) => {
    const transferNumber = data?.to
    dispatch.island.toggleIsOpen(true)
    handleAttendedTransfer(transferNumber)
  })

  async function handleAttendedTransfer(number: string) {
    // Send attended transfer message
    const transferringMessageSent = await attendedTransfer(number)
    if (transferringMessageSent) {
      // Set transferring and disable pause
      dispatch.currentCall.updateCurrentCall({
        transferring: true,
        paused: false,
      })
      // Play the remote audio element
      dispatch.player.playRemoteAudio()
    }
  }

  return <>{children}</>
}
