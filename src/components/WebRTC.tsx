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
import { eventDispatch, useEventListener, getJSONItem, setJSONItem } from '../utils'
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

  // Flag to prevent concurrent reloads
  const isReloading = useRef<boolean>(false)

  // Track when tab goes to background to detect long standby periods
  const lastVisibilityChange = useRef<number>(Date.now())
  const wasHidden = useRef<boolean>(false)
  const lastInactivityDuration = useRef<number>(0) // Duration of last inactivity period in ms

  // Track if connection became stale due to network errors (e.g., during standby)
  const connectionStale = useRef<boolean>(false)

  // Track when jsepGlobal was saved (for incoming calls)
  const jsepGlobalTimestamp = useRef<number | null>(null)

  // Track if page was frozen (standby, browser froze tab)
  const wasFrozen = useRef<boolean>(false)

  // Flag to prevent concurrent initWebRTC calls
  const isInitializing = useRef<boolean>(false)

  // Timeout ID for initialization safety timeout
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Janus from Janus library
  const janus = useRef<any>(JanusLib)

  let localTracks = {}
  let localVideos = 0
  let remoteTracks = {}
  let remoteVideos = 0

  // Initializes the webrtc connection and handlers
  const initWebRTC = useCallback(() => {
    // Prevent concurrent initWebRTC calls
    if (isInitializing.current) {
      console.log('[JANUS-GUARD] initWebRTC already in progress, skipping', {
        timestamp: new Date().toISOString()
      })
      return
    }
    isInitializing.current = true

    // Safety timeout: reset isInitializing if initialization doesn't complete in 30 seconds
    // This prevents getting stuck in an unrecoverable state after network timeouts
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current)
    }
    initTimeoutRef.current = setTimeout(() => {
      if (isInitializing.current) {
        console.warn('[JANUS-GUARD] Initialization timeout (30s) - resetting isInitializing flag', {
          timestamp: new Date().toISOString()
        })
        isInitializing.current = false
        connectionStale.current = true
        dispatch.alerts.setAlert('webrtc_down')
        eventDispatch('phone-island-alert-set', { type: 'webrtc_down' })
      }
      initTimeoutRef.current = null
    }, 30000)

    // Prevent multiple Janus session creation
    const { janusInstance: existingInstance, registered } = store.getState().webrtc

    // Check if existing session is valid and connected
    let shouldInit = true

    if (existingInstance) {
      // Verify the session is still connected
      const sessionId = existingInstance.getSessionId?.()
      const isConnected = existingInstance.isConnected?.()

      // Check how long the tab was in background (from last visibility change)
      const inactivityMs = lastInactivityDuration.current
      const inactivityMinutes = Math.round(inactivityMs / 60000)
      const longInactivity = inactivityMs > 30 * 60 * 1000 // 30 minutes

      // Check if there's an active call that should be preserved
      const { sipcall: currentSipcall, jsepGlobal: currentJsep }: { sipcall: any; jsepGlobal: any } = store.getState().webrtc
      const hasIncomingCall = !!currentJsep
      const hasActiveCall = currentSipcall?.webrtcStuff?.pc?.iceConnectionState === 'connected' ||
                             currentSipcall?.webrtcStuff?.pc?.iceConnectionState === 'completed'
      const hasAnyCall = hasIncomingCall || hasActiveCall

      // If session exists AND is connected AND registered, skip init
      // UNLESS there has been long inactivity (>30 min) WITHOUT an active call
      // (we preserve sessions with active calls even after long inactivity)
      if (isConnected && registered && (!longInactivity || hasAnyCall)) {
        console.log('[JANUS-GUARD] Valid session already exists, skipping init', {
          sessionId,
          isConnected,
          registered,
          inactivityMinutes,
          hasIncomingCall,
          hasActiveCall,
          timestamp: new Date().toISOString()
        })
        shouldInit = false
        // NOTE: Do NOT reset lastInactivityDuration here! It will be reset on next visibility change
        // or after a successful reload. Resetting here causes race conditions with phone-island-attach.
      } else {
        // Session exists but is dead/disconnected/stale, clean it up and recreate
        const reason = !isConnected
          ? 'not connected'
          : !registered
            ? 'not registered'
            : longInactivity
              ? `long inactivity (${inactivityMinutes} min) without active call`
              : 'unknown'

        console.warn('[JANUS-GUARD] Session exists but is invalid, cleaning up and reinitializing', {
          reason,
          sessionId,
          isConnected,
          registered,
          inactivityMinutes,
          hasIncomingCall,
          hasActiveCall,
          timestamp: new Date().toISOString()
        })

        // Cleanup dead/stale session
        try {
          existingInstance.destroy({ unload: true, notifyDestroyed: false, cleanupHandles: true })
        } catch (e) {
          console.error('[JANUS-GUARD] Error destroying session', e)
        }

        // Clear state to allow new session
        store.dispatch.webrtc.updateWebRTC({
          janusInstance: null,
          sipcall: null,
          registered: false,
          jsepGlobal: null,
        })
        // Will reset inactivity after successful reload
      }
    }

    if (!shouldInit) {
      isInitializing.current = false
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
        initTimeoutRef.current = null
      }
      return
    }

    console.log('[JANUS-GUARD] Creating new session', {
      timestamp: new Date().toISOString()
    })

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
                  // Reset init flag on plugin attach error
                  isInitializing.current = false
                  if (initTimeoutRef.current) {
                    clearTimeout(initTimeoutRef.current)
                    initTimeoutRef.current = null
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
                        // Update registered status to false
                        store.dispatch.webrtc.updateWebRTC({
                          registered: false,
                        })
                        eventDispatch('phone-island-webrtc-unregistered', {})
                        break

                      case 'registered':
                        if (janus.current.log)
                          janus.current.log(
                            'Successfully registered as ' + result['username'] + '!',
                          )
                        console.log('[REGISTER] Registration successful', {
                          username: result['username'],
                          wasAlreadyRegistered: store.getState().webrtc.registered,
                          timestamp: new Date().toISOString()
                        })
                        eventDispatch('phone-island-webrtc-registered', {})
                        if (!store.getState().webrtc.registered) {
                          store.dispatch.webrtc.updateWebRTC({
                            registered: true,
                          })
                        }
                        // Remove WebRTC connections alert if any
                        dispatch.alerts.removeAlert('webrtc_down')
                        eventDispatch('phone-island-alert-removed', {
                          type: 'webrtc_down',
                        })
                        // Connection is healthy again, reset stale flag
                        connectionStale.current = false
                        // Init completed successfully
                        isInitializing.current = false
                        if (initTimeoutRef.current) {
                          clearTimeout(initTimeoutRef.current)
                          initTimeoutRef.current = null
                        }
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

                        // ALWAYS save jsepGlobal when we receive an incoming call JSEP
                        // This allows answering from any device, even if it's not the default
                        if (jsep) {
                          console.log('[JSEP] Saving jsepGlobal for incoming call', {
                            from: result['username'],
                            timestamp: new Date().toISOString()
                          })
                          dispatch.webrtc.updateWebRTC({ jsepGlobal: jsep })
                          // Track when this call arrived
                          jsepGlobalTimestamp.current = Date.now()
                        }

                        if (
                          (uaType === 'mobile' && hasOnlineNethlink()) ||
                          (uaType === 'desktop' &&
                            (default_device?.type === 'webrtc' ||
                              (default_device?.type === undefined && !hasOnlineNethlink()) ||
                              (!hasOnlineNethlink() && default_device?.type === 'physical')))
                        ) {
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
                          const caller = result['username'] || result['displayname'] || store.getState().currentCall.number || 'Remote party'
                          janus.current.log(caller + ' accepted the call!')
                        }
                        // Set the remote description to janus lib
                        if (jsep) {
                          handleRemote(jsep)
                        }
                        // Clear jsepGlobal after call is accepted
                        console.log('[JSEP] Clearing jsepGlobal after call accepted', {
                          timestamp: new Date().toISOString()
                        })
                        dispatch.webrtc.updateWebRTC({ jsepGlobal: null })
                        jsepGlobalTimestamp.current = null

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
                        // Clear jsepGlobal when call ends
                        console.log('[JSEP] Clearing jsepGlobal on hangup', {
                          timestamp: new Date().toISOString()
                        })
                        dispatch.webrtc.updateWebRTC({ jsepGlobal: null })
                        jsepGlobalTimestamp.current = null

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

                      // Apply saved audio output device if available
                      const defaultAudioOutputDevice: any = getJSONItem('phone-island-audio-output-device')

                      if (defaultAudioOutputDevice?.deviceId) {
                        const applySavedDevice = async () => {
                          let targetDeviceId = defaultAudioOutputDevice.deviceId

                          // Check if the saved device is still available
                          if (targetDeviceId && targetDeviceId !== 'default') {
                            try {
                              const devices = await navigator.mediaDevices.enumerateDevices()
                              const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput')
                              const deviceExists = audioOutputDevices.some(device => device.deviceId === targetDeviceId)

                              if (!deviceExists) {
                                console.warn(`Saved audio device ${targetDeviceId} no longer available, using default device`)
                                targetDeviceId = 'default'
                                // Update localStorage with the fallback
                                setJSONItem('phone-island-audio-output-device', { deviceId: 'default' })
                              }
                            } catch (err) {
                              console.warn('Error checking device availability, using default:', err)
                              targetDeviceId = 'default'
                            }
                          }

                          // Apply the device
                          if (!remoteAudioElement.current) {
                            console.warn('Remote audio element no longer available')
                            return
                          }

                          try {
                            await remoteAudioElement.current.setSinkId(targetDeviceId)
                            console.info('Audio output device applied successfully to new stream:', targetDeviceId)
                          } catch (err) {
                            console.warn('Failed to apply audio output device to new stream:', err)
                            // Final fallback to default if not already using it
                            if (targetDeviceId !== 'default' && remoteAudioElement.current) {
                              try {
                                await remoteAudioElement.current.setSinkId('default')
                                setJSONItem('phone-island-audio-output-device', { deviceId: 'default' })
                                console.info('Fallback to default device successful')
                              } catch (defaultErr) {
                                console.error('Even default device failed:', defaultErr)
                              }
                            }
                          }
                        }

                        applySavedDevice()
                      }
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
            // Mark connection as stale due to network error
            console.warn('[JANUS-GUARD] Network error detected, marking connection as stale', {
              error: err,
              timestamp: new Date().toISOString()
            })
            connectionStale.current = true
            // Reset init flag on error so retry is possible
            isInitializing.current = false
            if (initTimeoutRef.current) {
              clearTimeout(initTimeoutRef.current)
              initTimeoutRef.current = null
            }
            // Activate webrtc connection alert
            dispatch.alerts.setAlert('webrtc_down')
          },
          destroyed: () => {
            console.log('[JANUS-GUARD] Session destroyed, clearing janusInstance', {
              timestamp: new Date().toISOString()
            })
            // Reset init flag when session is destroyed
            isInitializing.current = false
            if (initTimeoutRef.current) {
              clearTimeout(initTimeoutRef.current)
              initTimeoutRef.current = null
            }
            // Set webrtc destroyed status and clear janusInstance
            dispatch.webrtc.updateWebRTC({
              destroyed: true,
              janusInstance: null,
            })
            // Only activate alert if we're NOT already doing a voluntary reload
            // Otherwise we create a reload loop
            if (!isReloading.current) {
              console.log('[JANUS-GUARD] Activating webrtc_down alert (not a voluntary reload)')
              dispatch.alerts.setAlert('webrtc_down')
            } else {
              console.log('[JANUS-GUARD] Skipping alert activation (voluntary reload in progress)')
            }
          },
        })
        // Set janus instance to the store
        console.log('[JANUS-GUARD] Saving janusInstance to Redux', {
          sessionId: janusInstance.getSessionId?.(),
          timestamp: new Date().toISOString()
        })
        dispatch.webrtc.updateWebRTC({
          janusInstance,
        })
      },
    })
  }, [janus.current])

  // Check audio and video permissions when default_device is loaded or changed
  useEffect(() => {
    const { default_device } = store.getState().currentUser
    if (default_device !== undefined) {
      checkMediaPermissions()
    }
  }, [store?.getState()?.currentUser?.default_device])

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
      // Clear initialization timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
        initTimeoutRef.current = null
      }
    }
  }, [])

  // Manage reload events
  useEffect(() => {
    if (reload || connectionReturned) {
      // Check if WebRTC is actually disconnected using alerts (more reliable than registered/sipcall)
      const { data } = store.getState().alerts
      const { forceReload } = store.getState().island
      const { sipcall, janusInstance }: { sipcall: any; janusInstance: any } = store.getState().webrtc

      // Only do full reload if webrtc_down alert is active OR force reload is requested OR connection just returned
      const isWebRTCDown = data.webrtc_down?.active || false

      if (isWebRTCDown || forceReload || connectionReturned) {
        // Prevent concurrent reloads or interrupting an in-progress init
        if (isReloading.current || isInitializing.current) {
          console.log('[JANUS-GUARD] Reload or init already in progress, skipping', {
            isReloading: isReloading.current,
            isInitializing: isInitializing.current
          })
          return
        }

        isReloading.current = true

        // Clear any pending init timeout before starting reload
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current)
          initTimeoutRef.current = null
        }

        console.info(
          forceReload
            ? 'Force reload requested, performing full WebRTC reconnection'
            : connectionReturned
              ? 'Internet connection restored, performing full WebRTC reconnection'
              : 'WebRTC down detected (alert active), performing full reload'
        )
        // Reset force reload flag
        if (forceReload) {
          store.dispatch.island.setForceReload(false)
        }

        // Clear janusInstance and registered state from Redux to allow new session creation
        console.log('[JANUS-GUARD] Manual reload, clearing janusInstance and registered state', {
          timestamp: new Date().toISOString()
        })
        dispatch.webrtc.updateWebRTC({
          janusInstance: null,
          sipcall: null,
          registered: false,
          jsepGlobal: null, // Also clear stale jsepGlobal
        })
        jsepGlobalTimestamp.current = null // Clear timestamp to match jsepGlobal
        // Unregister the WebRTC extension
        unregister()
        // Detach sipcall
        if (sipcall) sipcall.detach()
        // Destroy Janus session (use janusInstance from store, NOT janus.current which is the library!)
        if (janusInstance && janusInstance.destroy) {
          janusInstance.destroy({
            unload: true,
            notifyDestroyed: false,
            cleanupHandles: true,
          })
        }
        // Initialize a new Janus session immediately
        setTimeout(() => {
          initWebRTC()
          // Reset connection returned flag
          if (connectionReturned) {
            setConnectionReturned(false)
          }
          // Execute the reloaded callback
          if (reloadedCallback) reloadedCallback()
          // Reset reload flag and other state flags after completion
          setTimeout(() => {
            isReloading.current = false
            connectionStale.current = false
            wasFrozen.current = false
            lastInactivityDuration.current = 0
          }, 1000)
        }, 100)
      } else {
        console.info('WebRTC already connected (no alert active), skipping heavy reload')
        // Execute callback without reload
        if (reloadedCallback) reloadedCallback()
      }
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

  // Detect page freeze/resume events (standby, browser freezing tab)
  useEffect(() => {
    const handleFreeze = () => {
      console.warn('[STANDBY-GUARD] Page frozen (standby or browser froze tab)', {
        timestamp: new Date().toISOString()
      })
      wasFrozen.current = true
    }

    const handleResume = () => {
      console.log('[STANDBY-GUARD] Page resumed from freeze', {
        timestamp: new Date().toISOString()
      })
      // wasFrozen flag will be checked on visibilitychange
    }

    document.addEventListener('freeze', handleFreeze)
    document.addEventListener('resume', handleResume)

    return () => {
      document.removeEventListener('freeze', handleFreeze)
      document.removeEventListener('resume', handleResume)
    }
  }, [])

  // Detect long standby periods and preemptively refresh WebRTC connection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now()

      if (document.hidden) {
        // Tab going to background - track this
        wasHidden.current = true
        lastVisibilityChange.current = now
        console.log('[STANDBY-GUARD] Tab going to background', {
          timestamp: new Date().toISOString()
        })
      } else if (wasHidden.current) {
        // Tab returning to foreground after being hidden
        const timeHidden = now - lastVisibilityChange.current
        const threeMinutes = 3 * 60 * 1000 // 3 minutes - fallback threshold for throttling

        // Save this duration so initWebRTC can check it later
        lastInactivityDuration.current = timeHidden

        console.log('[STANDBY-GUARD] Tab returning to foreground', {
          timeHiddenMs: timeHidden,
          timeHiddenMinutes: Math.round(timeHidden / 60000),
          wasFrozen: wasFrozen.current,
          timestamp: new Date().toISOString()
        })

        const { registered, jsepGlobal, sipcall }: { registered: boolean; jsepGlobal: any; sipcall: any } = store.getState().webrtc

        // Check if there's an active call (either incoming or in progress)
        const hasIncomingCall = !!jsepGlobal
        const hasActiveCall = sipcall?.webrtcStuff?.pc?.iceConnectionState === 'connected' ||
                               sipcall?.webrtcStuff?.pc?.iceConnectionState === 'completed'
        const hasAnyCall = hasIncomingCall || hasActiveCall

        // Check if we need to reload:
        // 1. Page was frozen (freeze event) - standby or browser froze tab, OR
        // 2. Connection is stale (network errors detected), OR
        // 3. Tab was throttled for >3 minutes without any call (preventive reload), OR
        // 4. Tab was throttled for >30 minutes ONLY if there's no call (incoming or active)
        const thirtyMinutes = 30 * 60 * 1000
        const wasThrottledShort = timeHidden > threeMinutes && !hasAnyCall // 3+ min without call
        // Only reload after 30+ min if no call at all (preserve both incoming and active calls!)
        const wasThrottledVeryLong = timeHidden > thirtyMinutes && !hasAnyCall
        const needsReload = wasFrozen.current || connectionStale.current || wasThrottledShort || wasThrottledVeryLong

        if (needsReload) {
          const reloadReason = wasFrozen.current
            ? 'frozen'
            : connectionStale.current
              ? 'stale connection'
              : wasThrottledVeryLong
                ? 'throttled >30min (session too old)'
                : 'throttled >3min'

          if (hasAnyCall) {
            const callType = hasActiveCall ? 'active call' : 'incoming call'
            console.warn(
              `[STANDBY-GUARD] Reload needed (${reloadReason}) but ${callType} in progress. ` +
              'Call will be lost but reload is necessary to restore connectivity.',
              {
                wasFrozen: wasFrozen.current,
                connectionStale: connectionStale.current,
                wasThrottledShort,
                wasThrottledVeryLong,
                hasIncomingCall,
                hasActiveCall,
                timestamp: new Date().toISOString()
              }
            )
          } else {
            console.warn(
              `[STANDBY-GUARD] Reload needed (${reloadReason}), forcing reload`,
              {
                wasFrozen: wasFrozen.current,
                connectionStale: connectionStale.current,
                wasThrottledShort,
                wasThrottledVeryLong,
                timestamp: new Date().toISOString()
              }
            )
          }
        } else if (hasAnyCall) {
          // No freeze/throttling detected and there's a call - preserve it
          const callType = hasActiveCall ? 'active call' : 'incoming call'
          console.log(
            `[STANDBY-GUARD] Tab change without issues, ${callType} preserved`,
            {
              timeHiddenMinutes: Math.round(timeHidden / 60000),
              hasIncomingCall,
              hasActiveCall,
              timestamp: new Date().toISOString()
            }
          )
        }

        // Reload if page was frozen, connection is stale, or throttled too long
        // BUT NOT if there's an incoming call (preserve jsepGlobal to allow answering)
        // Also don't reload if another init is already in progress
        const shouldReload = registered && !isReloading.current && !isInitializing.current && needsReload && !hasIncomingCall

        if (shouldReload) {
          console.warn(
            '[STANDBY-GUARD] ⚠️ Reloading WebRTC',
            {
              timestamp: new Date().toISOString()
            }
          )

          // Trigger preventive reload
          isReloading.current = true

          // Clear any pending init timeout before starting reload
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current)
            initTimeoutRef.current = null
          }

          // Clear existing session
          const { janusInstance, sipcall } = store.getState().webrtc
          // Unregister the WebRTC extension
          unregister()
          // Detach sipcall handle
          if (sipcall) sipcall.detach()
          // Destroy Janus session
          if (janusInstance && janusInstance.destroy) {
            janusInstance.destroy({
              unload: true,
              notifyDestroyed: false,
              cleanupHandles: true,
            })
          }

          // Clear state
          dispatch.webrtc.updateWebRTC({
            janusInstance: null,
            sipcall: null,
            registered: false,
            jsepGlobal: null,
          })
          jsepGlobalTimestamp.current = null

          // Reinitialize after a short delay
          setTimeout(() => {
            initWebRTC()
            setTimeout(() => {
              isReloading.current = false
              // Reset flags after successful reload
              connectionStale.current = false
              wasFrozen.current = false
              lastInactivityDuration.current = 0 // Reset inactivity duration after reload
            }, 1000)
          }, 100)
        }

        // Reset flags
        wasHidden.current = false
        // Reset frozen flag even if we didn't reload (for next cycle)
        if (!shouldReload) {
          wasFrozen.current = false
          // Reset inactivity duration since we've handled the visibility change
          lastInactivityDuration.current = 0
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [initWebRTC, dispatch])

  useEventListener('phone-island-attach', (data) => {
    console.log('[EVENT] phone-island-attach received, calling initWebRTC', {
      timestamp: new Date().toISOString()
    })
    initWebRTC()
    eventDispatch('phone-island-attached', {})
  })

  // Force WebRTC reload when socket reconnects after network change
  // This prevents stale Janus sessions that cause 469 "Unexpected ANSWER" errors
  useEventListener('phone-island-socket-reconnected', () => {
    console.log('[EVENT] phone-island-socket-reconnected received, forcing WebRTC reload', {
      timestamp: new Date().toISOString()
    })
    // Clear any stale jsepGlobal - it's invalid after network reconnect
    const { jsepGlobal } = store.getState().webrtc
    if (jsepGlobal) {
      console.log('[EVENT] Clearing stale jsepGlobal after socket reconnect', {
        timestamp: new Date().toISOString()
      })
      dispatch.webrtc.updateWebRTC({ jsepGlobal: null })
      jsepGlobalTimestamp.current = null // Clear timestamp to match jsepGlobal
    }
    // Trigger reload via connectionReturned (forceReload not needed - connectionReturned already triggers reload)
    setConnectionReturned(true)
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
