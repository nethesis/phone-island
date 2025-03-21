// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useRef, useCallback, useState } from 'react'
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
import { isPhysical } from '../lib/user/default_device'

interface WebRTCProps {
  children: ReactNode
  sipExten: string
  sipSecret: string
  hostName: string
  sipHost: string
  sipPort: string
  reload: boolean
  uaType: string
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
  uaType,
  reloadedCallback,
}) => {
  // Initialize store dispatch
  const dispatch = useDispatch<Dispatch>()

  // Initialize janus check interval id
  const janusCheckInterval = useRef<any>(null)

  // Initialize Janus from Janus library
  const janus = useRef<JanusTypes>(JanusLib)

  let localTracks = {}
  let localVideos = 0
  let remoteTracks = {}
  let remoteVideos = 0

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
                    const { view } = store.getState().island

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
                        eventDispatch('phone-island-webrtc-unregistered', {})
                        break

                      case 'registered':
                        if (janus.current.log)
                          janus.current.log(
                            'Successfully registered as ' + result['username'] + '!',
                          )
                        eventDispatch('phone-island-webrtc-registered', {})
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
                        if (view !== 'call') {
                          dispatch.island.setIslandView('call')
                        }
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
                        const { default_device } = store.getState().currentUser
                        const { endpoints, username } = store.getState().currentUser
                        const { extensions } = store.getState().users

                        const hasOnlineNethlink = () => {
                          if (!extensions || !username) return false

                          // Get all extensions for current user
                          const userExtensions: any = Object.values(extensions).filter(
                            (ext) => ext?.username === username,
                          )

                          // Check if any extension is nethlink type and online
                          return userExtensions?.some((ext) => {
                            const endpointExtension = endpoints?.extension.find(
                              (endpoint) => endpoint.id === ext?.exten,
                            )
                            return (
                              endpointExtension?.type === 'nethlink' && ext?.status !== 'offline'
                            )
                          })
                        }

                        if (
                          (uaType === 'mobile' && hasOnlineNethlink()) ||
                          (uaType === 'desktop' &&
                            (default_device?.type === 'webrtc' ||
                              (default_device?.type === undefined && !hasOnlineNethlink()) ||
                              (!hasOnlineNethlink() && default_device?.type === 'physical')))
                        ) {
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
                              incoming: true,
                              incomingWebRTC: true,
                            })

                            if (janus.current.log) {
                              dispatch.currentCall.updateIncoming(true)
                              janus.current.log('Incoming call from ' + result['username'] + '!')
                            }
                          }

                          // Update the webrtc last activity time
                          dispatch.webrtc.updateLastActivity(new Date().getTime())
                        }

                        break

                      case 'accepted':
                        const acceptedTimestamp = Math.floor(Date.now() / 1000)
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

                        // Set incoming value to false and set start time
                        dispatch.currentCall.updateCurrentCall({
                          incoming: false,
                          incomingWebRTC: false,
                          startTime: acceptedTimestamp?.toString(),
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
                        if (!isPhysical() && uaType !== 'mobile') {
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
                          // Reset current call info
                          store.dispatch.currentCall.reset()
                          if (janus.current.log)
                            janus.current.log(
                              'Call hung up (' + result['code'] + ' ' + result['reason'] + ')!',
                            )
                          // Update webrtc lastActivity time
                          dispatch.webrtc.updateLastActivity(new Date().getTime())
                          // stopScreenSharingI()
                        }

                        // Stop the local audio element ringing
                        store.dispatch.player.stopAudioPlayer()

                        console.log('aaa hanging up, view', view) ////

                        // Stop screen sharing if active
                        const {
                          active: screenShareActive,
                          plugin,
                          localScreenStream,
                          remoteScreenStream,
                        } = store.getState().screenShare

                        if (screenShareActive) {
                          janus.current.stopAllTracks(localScreenStream)
                          janus.current.stopAllTracks(remoteScreenStream)
                          dispatch.screenShare.update({ active: false })
                          plugin.detach()

                          console.log('aaa screenshare detached') ////
                        }
                        break

                      case 'gateway_down':
                        console.warn('THE GATEWAY IS DOWN')

                        break

                      case 'info':
                        // Check if it's a keyframe request (see: https://github.com/meetecho/janus-gateway/pull/3517)
                        if (
                          result['type'] === 'application/media_control+xml' &&
                          result['content'].includes('<picture_fast_update')
                        ) {
                          sipcall.send({
                            message: { request: 'keyframe', user: true, peer: true },
                          })
                        }
                        break

                      default:
                        if (janus.current.debug) {
                          janus.current.debug('Event not handled:', event)
                        }
                        break
                    }
                  }
                },
                onlocaltrack: function (track, on) {
                  if (janus.current.debug) {
                    janus.current.debug('Local track ' + (on ? 'added' : 'removed') + ':', track)
                  }

                  // We use the track ID as name of the element, but it may contain invalid characters
                  let trackId = track.id.replace(/[{}]/g, '')
                  if (!on) {
                    // Track removed, get rid of the stream and the rendering
                    let stream = localTracks[trackId]
                    if (stream) {
                      try {
                        let tracks = stream.getTracks()
                        for (let i in tracks) {
                          let mst = tracks[i]
                          if (mst) mst.stop()
                        }
                      } catch (e: any) {
                        if (janus.current.error) {
                          janus.current.error('Error removing track:', e)
                        }
                      }
                    }
                    if (track.kind === 'video') {
                      localVideos--
                    }
                    delete localTracks[trackId]
                    return
                  }
                  // If we're here, a new track was added
                  let stream = localTracks[trackId]
                  if (stream) {
                    // We've been here already
                    return
                  }
                  if (track.kind === 'audio') {
                    // We ignore local audio tracks, they'd generate echo anyway

                    stream = new MediaStream([track])

                    // Save the new audio stream to the store
                    store.dispatch.webrtc.updateLocalAudioStream(stream)
                  } else {
                    // New video track: create a stream out of it
                    localVideos++
                    stream = new MediaStream([track])

                    // Save the new video stream to the store
                    store.dispatch.webrtc.updateLocalVideoStream(stream)

                    localTracks[trackId] = stream
                    if (janus.current.debug) {
                      janus.current.debug('Created local stream:', stream)
                    }
                    const localVideoElement = store.getState().player.localVideo

                    if (
                      janus.current.attachMediaStream &&
                      localVideoElement &&
                      localVideoElement.current
                    ) {
                      janus.current.attachMediaStream(localVideoElement.current, stream)
                    }
                  }
                },
                onremotetrack: function (track, mid, on) {
                  if (janus.current.debug) {
                    janus.current.debug(
                      'Remote track (mid=' + mid + ') ' + (on ? 'added' : 'removed') + ':',
                      track,
                    )
                  }

                  // Stop the local audio element ringing
                  store.dispatch.player.stopAudioPlayer()

                  if (!on) {
                    // Track removed, get rid of the stream and the rendering
                    if (track.kind === 'video') {
                      remoteVideos--
                    }
                    delete remoteTracks[mid]

                    // Show remote video placeholder
                    dispatch.currentCall.updateCurrentCall({
                      showRemoteVideoPlaceHolder: true,
                    })

                    return
                  }

                  if (track.kind === 'audio') {
                    // New audio track: create a stream out of it, and use a hidden <audio> element
                    let stream = new MediaStream([track])
                    remoteTracks[mid] = stream
                    if (janus.current.debug) {
                      janus.current.debug('Created remote audio stream: ' + stream)
                    }
                    const remoteAudioElement = store.getState().player.remoteAudio

                    if (
                      remoteAudioElement &&
                      remoteAudioElement.current &&
                      janus.current.attachMediaStream
                    ) {
                      janus.current.attachMediaStream(remoteAudioElement.current, stream)
                    }
                    // Save the new audio stream to the store
                    store.dispatch.webrtc.updateRemoteAudioStream(stream)
                  } else {
                    // New video track: create a stream out of it
                    remoteVideos++
                    let stream = new MediaStream([track])

                    // Save the new video stream to the store
                    store.dispatch.webrtc.updateRemoteVideoStream(stream)

                    remoteTracks[mid] = stream
                    if (janus.current.debug) {
                      janus.current.debug('Created remote video stream:' + stream)
                    }
                    const largeRemoteVideoElement = store.getState().player.largeRemoteVideo
                    const smallRemoteVideoElement = store.getState().player.smallRemoteVideo

                    if (
                      janus.current.attachMediaStream &&
                      largeRemoteVideoElement &&
                      largeRemoteVideoElement.current
                    ) {
                      janus.current.attachMediaStream(largeRemoteVideoElement.current, stream)
                    }

                    if (
                      janus.current.attachMediaStream &&
                      smallRemoteVideoElement &&
                      smallRemoteVideoElement.current
                    ) {
                      janus.current.attachMediaStream(smallRemoteVideoElement.current, stream)

                      // Hide remote video placeholder
                      dispatch.currentCall.updateCurrentCall({
                        showRemoteVideoPlaceHolder: false,
                      })
                    }
                  }
                },
                oncleanup: function () {
                  if (janus.current.log) {
                    janus.current.log(' ::: janus Got a cleanup notification :::')
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
        // Set janus instance to the store
        dispatch.webrtc.updateWebRTC({
          janusInstance,
        })
      },
    })
  }, [janus.current])

  // Check audio and video permissions
  useEffect(() => {
    checkMediaPermissions()
  }, [])

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionReturned, setConnectionReturned] = useState(false)
  const wasOfflineRef = useRef(false)

  useEffect(() => {
    // Event listeners for online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Reconnection management
  useEffect(() => {
    if (!isOnline) {
      console.log('Internet connection lost.')
      wasOfflineRef.current = true
      setConnectionReturned(false)
    } else if (wasOfflineRef.current) {
      console.log('Internet connection restored.')
      setConnectionReturned(true)
      wasOfflineRef.current = false
    }
  }, [isOnline])

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
    if (reload || connectionReturned) {
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
  }, [reload, connectionReturned])

  // Manage media devices (audio/video)
  useEffect(() => {
    const getMediaDevices = () => {
      if (navigator && navigator?.mediaDevices && navigator?.mediaDevices?.enumerateDevices) {
        navigator?.mediaDevices
          .enumerateDevices()
          .then((deviceInfos) => {
            dispatch.mediaDevices.updateMediaDevices(deviceInfos)
          })
          .catch((error) => {
            console.error('Error fetching devices:', error)
          })
      } else {
        console.warn('MediaDevices API not supported in this browser or context')
        dispatch.mediaDevices.updateMediaDevices([])
      }
    }
    getMediaDevices()

    if (navigator && navigator?.mediaDevices) {
      navigator?.mediaDevices?.addEventListener('devicechange', getMediaDevices)

      return () => {
        navigator?.mediaDevices?.removeEventListener('devicechange', getMediaDevices)
      }
    }
  }, [])

  useEventListener('phone-island-attach', (data) => {
    initWebRTC()
    eventDispatch('phone-island-attached', {})
  })

  /**
   * Event listner for phone-island-call-transfer event
   */
  useEventListener('phone-island-call-transfer', (data) => {
    const transferNumber = data?.to
    dispatch.island.toggleIsOpen(true)
    handleAttendedTransfer(transferNumber)
    eventDispatch('phone-island-call-transfer-opened', {})
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
