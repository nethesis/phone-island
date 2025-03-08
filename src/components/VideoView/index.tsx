// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDisplay,
  faExpand,
  faMicrophone,
  faMicrophoneSlash,
  faPause,
  faPlay,
  faStop,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { eventDispatch, useEventListener, useIsomorphicLayoutEffect } from '../../utils'
import Hangup from '../Hangup'
import {
  muteCurrentCall,
  pauseCurrentCall,
  recordCurrentCall,
  unmuteCurrentCall,
  unpauseCurrentCall,
} from '../../lib/phone/call'
import { JanusTrack, JanusTypes } from '../../types/webrtc'
import JanusLib from '../../lib/webrtc/janus.js'
import Avatar from '../CallView/Avatar'
import Timer from '../CallView/Timer'
import { isPhysical } from '../../lib/user/default_device'
import { AudioBars } from '../AudioBars'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { faDisplaySlash, faRecord } from '@nethesis/nethesis-solid-svg-icons'
import { getCurrentVideoInputDeviceId } from '../../lib/devices/devices'
import { getInitials } from '../../lib/avatars/avatars'
import Dropdown from '../Dropdown'
import { getAvailableDevices } from '../../utils/deviceUtils'

export interface VideoViewProps {}

export type ScreenSharingMessage = {
  message: 'screenSharingStart' | 'screenSharingStop'
  roomId: string
  destUser: string
  callUser: string
}

export const VideoView: FC<VideoViewProps> = () => {
  const dispatch = useDispatch<Dispatch>()
  const {
    muted,
    startTime,
    isRecording,
    paused,
    isLocalVideoEnabled,
    showRemoteVideoPlaceHolder,
    hasVideoTrackAdded,
    displayName,
  } = useSelector((state: RootState) => state.currentCall)
  const {
    source,
    localTracks,
    localVideos,
    role: screenShareRole,
    active: screenShareActive,
  } = useSelector((state: RootState) => state.screenShare)
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { janusInstance, remoteAudioStream } = useSelector((state: RootState) => state.webrtc)
  const allUsersInfo = useSelector((state: RootState) => state.users)
  const userInfo = store.getState().currentUser
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isUiShown, setUiShown] = useState(false)
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const screenShareViewRef = useRef(null)
  const localScreen = useRef<HTMLVideoElement>(null)
  const remoteScreen = useRef<HTMLVideoElement>(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const largeRemoteVideo = useRef<HTMLVideoElement>(null)
  const smallRemoteVideo = useRef<HTMLVideoElement>(null)
  const janus = useRef<JanusTypes>(JanusLib)

  useIsomorphicLayoutEffect(() => {
    dispatch.player.updatePlayer({
      localScreen: localScreen,
      remoteScreen: remoteScreen,
      localVideo: localVideo,
      largeRemoteVideo: largeRemoteVideo,
      smallRemoteVideo: smallRemoteVideo,
    })
  }, [])

  // component did mount
  useEffect(() => {
    updateScreenStreams()
    updateVideoStreams()

    // register for full screen change
    addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      removeEventListener('fullscreenchange', handleFullscreenChange)

      // clear timeout
      if (uiTimeoutRef.current) {
        clearTimeout(uiTimeoutRef.current)
      }
    }
  }, [])

  // isOpen changed
  useEffect(() => {
    updateScreenStreams()
    updateVideoStreams()
  }, [isOpen])

  const updateVideoStreams = () => {
    const localVideoElement = store.getState().player.localVideo
    const largeRemoteVideoElement = store.getState().player.largeRemoteVideo
    const smallRemoteVideoElement = store.getState().player.smallRemoteVideo
    const { localVideoStream, remoteVideoStream } = store.getState().webrtc

    // local video stream

    if (localVideoElement?.current) {
      if (janus.current.attachMediaStream) {
        janus.current.attachMediaStream(localVideoElement.current, localVideoStream as MediaStream)
      }
    }

    // large remote video stream

    if (largeRemoteVideoElement?.current && janus.current.attachMediaStream) {
      janus.current.attachMediaStream(
        largeRemoteVideoElement.current,
        remoteVideoStream as MediaStream,
      )
    }

    // small remote video stream

    if (smallRemoteVideoElement?.current && janus.current.attachMediaStream) {
      janus.current.attachMediaStream(
        smallRemoteVideoElement.current,
        remoteVideoStream as MediaStream,
      )
    }
  }

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement)
  }

  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      // exit full screen
      document.exitFullscreen()
      eventDispatch('phone-island-fullscreen-exited', {})
    } else {
      // enter full screen
      if (screenShareViewRef.current) {
        ;(screenShareViewRef.current as HTMLElement).requestFullscreen()
        eventDispatch('phone-island-fullscreen-entered', {})
      }
    }
  }
  useEventListener('phone-island-fullscreen-enter', () => {
    toggleFullScreen()
  })
  useEventListener('phone-island-fullscreen-exit', () => {
    toggleFullScreen()
  })

  const newRemoteFeed = (id, display) => {
    // A new feed has been published, create a new plugin handle and attach to it as a listener

    dispatch.screenShare.update({
      source: id,
    })

    let remoteFeed: any = null
    janusInstance?.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: janus.current.randomString(32),
      success: function (pluginHandle) {
        remoteFeed = pluginHandle

        dispatch.screenShare.update({
          remoteFeed: pluginHandle,
        })
        remoteFeed.remoteTracks = {}
        remoteFeed.remoteVideos = 0
        janus.current.log?.(
          'Plugin attached! (' + remoteFeed.getPlugin() + ', id=' + remoteFeed.getId() + ')',
        )
        janus.current.log?.('  -- This is a subscriber')
        // We wait for the plugin to send us an offer
        const { room } = store.getState().screenShare

        let listen = {
          request: 'join',
          room: room,
          ptype: 'subscriber',
          feed: id,
        }
        remoteFeed.send({ message: listen })
      },
      error: function (error) {
        janus.current.error?.('Error attaching videoroom plugin', error)
      },
      iceState: function (state) {
        janus.current.log?.('ICE state (feed #' + remoteFeed.rfindex + ') changed to ' + state)
      },
      webrtcState: function (on) {
        janus.current.log?.(
          'Janus says this WebRTC PeerConnection (feed #' +
            remoteFeed.rfindex +
            ') is ' +
            (on ? 'up' : 'down') +
            ' now',
        )
      },
      slowLink: function (uplink, lost, mid) {
        janus.current.warn?.(
          'Janus reports problems ' +
            (uplink ? 'sending' : 'receiving') +
            ' packets on mid ' +
            mid +
            ' (' +
            lost +
            ' lost packets)',
        )
      },
      onmessage: function (msg, jsep) {
        janus.current.debug?.(' ::: Got a message (listener) :::', msg)
        let event = msg['videoroom']
        janus.current.debug?.('Event: ' + event)
        if (event) {
          if (event === 'attached') {
            // Subscriber created and attached
            janus.current.log?.(
              'Successfully attached to feed ' + id + ' (' + display + ') in room ' + msg['room'],
            )
          } else {
            janus.current.warn?.('Unhandled event: ' + event)
          }
        }
        if (jsep) {
          janus.current.debug?.('Handling SDP as well...', jsep)
          // Answer and attach
          remoteFeed.createAnswer({
            jsep: jsep,
            // We only specify data channels here, as this way in
            // case they were offered we'll enable them. Since we
            // don't mention audio or video tracks, we autoaccept them
            // as recvonly (since we won't capture anything ourselves)
            tracks: [{ type: 'data' }],
            success: function (jsep) {
              janus.current.debug?.('Got SDP!', jsep)

              const { room } = store.getState().screenShare

              let body = { request: 'start', room: room }
              remoteFeed.send({ message: body, jsep: jsep })
            },
            error: function (error) {
              janus.current.error?.('WebRTC error:', error)
            },
          })
        }
      },
      // eslint-disable-next-line no-unused-vars
      onlocaltrack: function (track, on) {
        // The subscriber stream is recvonly, we don't expect anything here
      },
      onremotetrack: function (track, mid, on, metadata) {
        janus.current.debug?.(
          'Remote track (mid=' +
            mid +
            ') ' +
            (on ? 'added' : 'removed') +
            (metadata ? ' (' + metadata.reason + ') ' : '') +
            ':',
          track,
        )
        // Screen sharing tracks are sometimes muted/unmuted by browser
        // when data is not flowing fast enough; this can make streams blink.
        // We can ignore these.
        if (
          track.kind === 'video' &&
          metadata &&
          (metadata.reason === 'mute' || metadata.reason === 'unmute')
        ) {
          janus.current.log?.('Ignoring mute/unmute on screen-sharing track.')
          return
        }
        if (!on) {
          const { remoteScreenStream } = store.getState().screenShare
          janus.current.stopAllTracks(remoteScreenStream)
          dispatch.screenShare.update({ active: false })
          return
        }
        // If we're here, a new track was added
        if (track.kind === 'video') {
          // New video track: create a stream out of it
          let stream = new MediaStream([track])

          // Save the new video stream to the store
          store.dispatch.screenShare.update({ remoteScreenStream: stream })

          remoteFeed.remoteTracks[mid] = stream
          janus.current.log?.('Created remote video stream: ' + stream)
          const remoteScreenElement = store.getState().player.remoteScreen

          if (remoteScreenElement?.current) {
            janus.current.attachMediaStream?.(remoteScreenElement.current, stream)
          }
        }
      },
      oncleanup: function () {
        janus.current.log?.(' ::: Got a cleanup notification (remote feed ' + id + ') :::')
        remoteFeed.remoteTracks = {}
        remoteFeed.remoteVideos = 0
      },
    })
  }

  const enableVideo = () => {
    const { sipcall }: { sipcall: any } = store.getState().webrtc
    store.dispatch.currentCall.updateCurrentCall({
      isLocalVideoEnabled: true,
    })
    const tracks: JanusTrack[] = []
    const currentVideoInputDeviceId = getCurrentVideoInputDeviceId()

    const track: Partial<JanusTrack> = {
      type: 'video',
      recv: true,
    }

    if (currentVideoInputDeviceId) {
      track.capture = { deviceId: { exact: currentVideoInputDeviceId } }
    } else {
      track.capture = true
    }

    const { hasVideoTrackAdded } = store.getState().currentCall

    if (!hasVideoTrackAdded) {
      track.add = true
      dispatch.currentCall.setVideoTrackAdded(true)
    } else {
      // replace video track (video track has been previously added and removed)
      track.replace = true
      track.mid = '1'
    }
    tracks.push(track as JanusTrack)

    sipcall.createOffer({
      tracks: tracks,
      success: function (jsep) {
        sipcall.send({ message: { request: 'update' }, jsep: jsep })
        eventDispatch('phone-island-video-enabled', {})
      },
      error: function (error) {
        console.error('WebRTC error... ' + JSON.stringify(error))
      },
    })
  }
  useEventListener('phone-island-video-enable', () => {
    enableVideo()
  })

  const disableVideo = () => {
    const { sipcall, localVideoStream }: { sipcall: any; localVideoStream: MediaStream | null } =
      store.getState().webrtc

    janus.current.stopAllTracks(localVideoStream)
    store.dispatch.webrtc.updateLocalVideoStream(null)
    store.dispatch.currentCall.setLocalVideoEnabled(false)
    const tracks: JanusTrack[] = []
    tracks.push({ type: 'video', mid: '1', remove: true })

    sipcall.createOffer({
      tracks: tracks,
      success: function (jsep) {
        sipcall.send({ message: { request: 'update' }, jsep: jsep })
        eventDispatch('phone-island-video-disabled', {})
      },
      error: function (error) {
        console.error('WebRTC error... ' + JSON.stringify(error))
      },
    })
  }
  useEventListener('phone-island-video-disable', () => {
    disableVideo()
  })

  const toggleVideo = () => {
    if (isLocalVideoEnabled) {
      disableVideo()
    } else {
      enableVideo()
    }
  }

  const shareScreen = () => {
    if (!janus.current.isExtensionEnabled()) {
      janus.current.error?.(
        "This browser doesn't support screensharing (getDisplayMedia unavailable)",
      )
      return
    }

    // Create a new room
    const roomName = janus.current.randomString(32)

    let create = {
      request: 'create',
      description: roomName,
      bitrate: 500000,
      publishers: 1,
    }

    const { plugin } = store.getState().screenShare

    plugin.send({
      message: create,
      success: function (result) {
        if (result['error']) {
          janus.current.error?.("Couldn't create room: " + result['error'])
          return
        }
        let event = result['videoroom']
        janus.current.debug?.('Event: ' + event)
        if (event) {
          // Our own screen sharing session has been created, join it

          const room = result['room']
          // Set room to the store
          dispatch.screenShare.update({
            room: room,
          })

          janus.current.log?.('Screen sharing session created: ' + room)

          const { username } = store.getState().currentUser

          let register = {
            request: 'join',
            room: room,
            ptype: 'publisher',
            display: username,
          }
          plugin.send({ message: register })
        }
      },
    })
  }

  const initScreenShare = () => {
    janusInstance?.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: janus.current.randomString(32),
      success: function (pluginHandle) {
        // Set plugin to the store
        dispatch.screenShare.update({
          plugin: pluginHandle,
        })
        const { role } = store.getState().screenShare

        if (role === 'publisher') {
          shareScreen()
        } else if (role === 'listener') {
          joinScreenShare()
        }
        eventDispatch('phone-island-screen-share-started', {})
      },
      error: function (error) {
        janus.current.error?.('Error attaching videoroom plugin', error)
      },
      consentDialog: function (on) {},
      iceState: function (state) {
        janus.current.log?.('ICE state changed to ' + state)
      },
      mediaState: function (medium, on) {
        janus.current.log?.('Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium)
      },
      webrtcState: function (on) {
        janus.current.log?.(
          'Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now',
        )
      },
      slowLink: function (uplink, lost, mid) {
        janus.current.warn?.(
          'Janus reports problems ' +
            (uplink ? 'sending' : 'receiving') +
            ' packets on mid ' +
            mid +
            ' (' +
            lost +
            ' lost packets)',
        )
      },
      onmessage: function (msg, jsep) {
        janus.current.debug?.(' ::: Got a message (publisher) :::', msg)
        const { plugin, role } = store.getState().screenShare
        const event = msg['videoroom']
        janus.current.debug?.('Event: ' + event)

        if (event) {
          if (event === 'joined') {
            if (role === 'publisher') {
              // This is our session, publish our stream
              janus.current.debug?.('Negotiating WebRTC stream for our screen')

              plugin.createOffer({
                // We want sendonly audio and screensharing
                tracks: [
                  { type: 'audio', capture: true, recv: false },
                  { type: 'screen', capture: true, recv: false },
                ],
                success: function (jsep) {
                  janus.current.debug?.('Got publisher SDP!', jsep)
                  let publish = { request: 'configure', audio: true, video: true }
                  plugin.send({ message: publish, jsep: jsep })
                },
                error: function (error) {
                  janus.current.error?.('WebRTC error:', error)
                  dispatch.screenShare.update({ active: false, role: '' })
                },
              })
            } else {
              // We're just watching a session, any feed to attach to?
              if (msg['publishers']) {
                let list = msg['publishers']
                janus.current.debug?.('Got a list of available publishers/feeds:', list)
                for (let f in list) {
                  if (list[f]['dummy']) continue
                  let id = list[f]['id']
                  let display = list[f]['display']
                  janus.current.debug?.('  >> [' + id + '] ' + display)
                  newRemoteFeed(id, display)
                }
              }
            }
          } else if (event === 'event') {
            // Any feed to attach to?
            if (role === 'listener' && msg['publishers']) {
              let list = msg['publishers']
              janus.current.debug?.('Got a list of available publishers/feeds:', list)
              for (let f in list) {
                if (list[f]['dummy']) continue
                let id = list[f]['id']
                let display = list[f]['display']
                janus.current.debug?.('  >> [' + id + '] ' + display)
                newRemoteFeed(id, display)
              }
            } else if (msg['leaving']) {
              // One of the publishers has gone away?
              let leaving = msg['leaving']
              janus.current.log?.('Publisher left: ' + leaving)
            } else if (msg['error']) {
              janus.current.error?.('Error event: ' + msg['error'])
            }
          }
        }
        if (jsep) {
          janus.current.debug?.('Handling SDP as well...', jsep)
          plugin.handleRemoteJsep({ jsep: jsep })
        }
      },
      onlocaltrack: function (track, on) {
        janus.current.debug?.('Local track ' + (on ? 'added' : 'removed') + ':', track)
        // We use the track ID as name of the element, but it may contain invalid characters
        let trackId = track.id.replace(/[{}]/g, '')
        if (!on) {
          // Track removed, get rid of the stream and the rendering
          let stream = localTracks?.[trackId]
          if (stream) {
            try {
              let tracks = stream.getTracks()
              for (let i in tracks) {
                let mst = tracks[i]
                if (mst) mst.stop()
              }
              // eslint-disable-next-line no-unused-vars
            } catch (e) {}
          }
          if (track.kind === 'video') {
            dispatch.screenShare.update({
              localVideos: localVideos - 1,
            })
          }

          // remove track
          const filteredTracks = localTracks?.filter((track) => track !== localTracks[trackId])
          dispatch.screenShare.update({
            localTracks: filteredTracks,
          })
          return
        }
        // If we're here, a new track was added
        let stream = localTracks?.[trackId]
        if (stream) {
          // We've been here already
          return
        }

        if (track.kind === 'video') {
          // New video track: create a stream out of it
          dispatch.screenShare.update({
            localVideos: localVideos + 1,
          })
          let stream = new MediaStream([track])

          // Save the new video stream to the store
          store.dispatch.screenShare.update({
            localScreenStream: stream,
          })

          janus.current.log?.('Created local stream: ' + stream)
          const localScreenElement = store.getState().player.localScreen

          if (localScreenElement?.current) {
            janus.current.attachMediaStream?.(localScreenElement.current, stream)
            inviteOtherUser()

            // Listen for the 'ended' event on the screen-sharing track
            track.addEventListener('ended', () => {
              eventDispatch('phone-island-screen-share-stop', {})
            })
          }
        }
        const { plugin } = store.getState().screenShare

        if (
          plugin.webrtcStuff.pc.iceConnectionState !== 'completed' &&
          plugin.webrtcStuff.pc.iceConnectionState !== 'connected'
        ) {
        }
      },
      // eslint-disable-next-line no-unused-vars
      onremotetrack: function (track, mid, on) {
        // The publisher stream is sendonly, we don't expect anything here
      },
      oncleanup: function () {
        janus.current.log?.(' ::: Got a cleanup notification :::')

        dispatch.screenShare.update({
          localTracks: {},
          localVideos: 0,
        })
      },
    })
  }

  const updateScreenStreams = () => {
    const localScreenElement = store.getState().player.localScreen
    const remoteScreenElement = store.getState().player.remoteScreen
    const { localScreenStream, remoteScreenStream } = store.getState().screenShare

    // local screen stream

    if (localScreenElement?.current) {
      if (janus.current.attachMediaStream) {
        janus.current.attachMediaStream(
          localScreenElement.current,
          localScreenStream as MediaStream,
        )
      }
    }

    // remote screen stream

    if (remoteScreenElement?.current) {
      if (janus.current.attachMediaStream) {
        janus.current.attachMediaStream(
          remoteScreenElement.current,
          remoteScreenStream as MediaStream,
        )
      }
    }
  }

  const inviteOtherUser = () => {
    // send message to websocket to invite the other user
    const { socket } = store.getState().websocket
    const { username: destUsername } = store.getState().currentCall
    const { room } = store.getState().screenShare
    const { username } = store.getState().currentUser

    socket.emit('message', {
      message: 'screenSharingStart',
      roomId: room,
      destUser: destUsername,
      callUser: username,
    } as ScreenSharingMessage)
  }

  const initAndStartScreenShare = () => {
    dispatch.screenShare.update({ active: true, role: 'publisher' })
    initScreenShare()
  }
  useEventListener('phone-island-screen-share-start', () => {
    initAndStartScreenShare()
  })

  const initAndJoinScreenShare = (joinData: ScreenSharingMessage) => {
    dispatch.screenShare.update({ active: true, role: 'listener', room: joinData.roomId })
    initScreenShare()
    eventDispatch('phone-island-screen-share-joined', {})
  }
  useEventListener('phone-island-screen-share-joining', (data: ScreenSharingMessage) => {
    initAndJoinScreenShare(data)
  })

  const joinScreenShare = () => {
    const { room } = store.getState().screenShare
    const { username } = store.getState().currentUser

    const joinMessage = {
      request: 'join',
      room: room,
      ptype: 'publisher',
      display: username,
    }

    const { plugin } = store.getState().screenShare
    plugin.send({ message: joinMessage })
  }

  const leaveScreenShare = (leaveData: ScreenSharingMessage) => {
    const { remoteScreenStream } = store.getState().screenShare
    janus.current.stopAllTracks(remoteScreenStream)
    dispatch.screenShare.update({ active: false })
    eventDispatch('phone-island-screen-share-leaved', {})
  }
  useEventListener('phone-island-screen-share-leaving', (data: ScreenSharingMessage) => {
    leaveScreenShare(data)
  })

  const handleMouseMove = () => {
    setUiShown(true)

    if (uiTimeoutRef.current) {
      clearTimeout(uiTimeoutRef.current)
      uiTimeoutRef.current = null
    }
  }

  const startHideTimer = () => {
    // start a timer when mouse stops moving to hide video UI
    uiTimeoutRef.current = setTimeout(() => {
      setUiShown(false)
    }, 3000)
  }

  const handleMouseMoveWithDebounce = () => {
    handleMouseMove()

    // clear the previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // set a new debounce timer - when this isn't cleared, it means the mouse has stopped
    debounceTimerRef.current = setTimeout(() => {
      startHideTimer()
    }, 100) // small delay to detect "stopped moving"
  }

  const stopScreenShare = () => {
    const { localScreenStream } = store.getState().screenShare

    janus.current.stopAllTracks(localScreenStream)
    dispatch.screenShare.update({ active: false })

    // send message to websocket to tell the other user the screen share has stopped
    const { socket } = store.getState().websocket
    const { username: destUsername } = store.getState().currentCall
    const { room } = store.getState().screenShare
    const { username } = store.getState().currentUser

    socket.emit('message', {
      message: 'screenSharingStop',
      roomId: room,
      destUser: destUsername,
      callUser: username,
    } as ScreenSharingMessage)
    eventDispatch('phone-island-screen-share-stopped', {})
  }
  useEventListener('phone-island-screen-share-stop', () => {
    stopScreenShare()
  })

  const pauseCall = () => {
    pauseCurrentCall()
    eventDispatch('phone-island-screen-share-stop', {})
  }

  return (
    <>
      {isOpen ? (
        <div
          ref={screenShareViewRef}
          onMouseMove={() => handleMouseMoveWithDebounce()}
          className={isFullscreen ? 'pi-h-screen' : 'pi-h-[480px] pi-w-[600px]'}
        >
          <div className={`pi-flex pi-relative pi-justify-center pi-w-full pi-h-full`}>
            {/* large remote screen */}
            <video
              autoPlay
              muted={true}
              ref={remoteScreen}
              className={`pi-rounded-2xl pi-w-full pi-h-full ${
                !screenShareActive || screenShareRole !== 'listener' ? 'pi-hidden' : ''
              }`}
            ></video>
            {/* large local screen */}
            <video
              autoPlay
              muted={true}
              ref={localScreen}
              className={`pi-rounded-2xl pi-w-full pi-h-full ${
                !screenShareActive || screenShareRole !== 'publisher' ? 'pi-hidden' : ''
              }`}
            ></video>
            {/* large remote video */}
            <video
              autoPlay
              muted={true}
              ref={largeRemoteVideo}
              className={`pi-rounded-2xl ${
                screenShareActive || showRemoteVideoPlaceHolder ? 'pi-hidden' : ''
              }`}
            ></video>
            {/* remote video placeholder */}
            <div
              className={`pi-w-full pi-bg-gray-200 dark:pi-bg-gray-800 pi-flex pi-items-center pi-justify-center ${
                screenShareActive || !showRemoteVideoPlaceHolder ? 'pi-hidden' : ''
              }`}
            >
              <div className='pi-rounded-full pi-bg-gray-700 dark:pi-bg-gray-200 pi-w-32 pi-h-32 pi-flex pi-items-center pi-justify-center'>
                <span className='pi-text-4xl pi-text-gray-50 dark:pi-text-gray-900'>
                  {getInitials(displayName)}
                </span>
              </div>
            </div>
            {/* small local video */}
            <video
              muted={true}
              autoPlay
              ref={localVideo}
              className={`pi-max-w-32 pi-max-h-32 pi-absolute pi-top-5 pi-right-5 pi-rounded-lg ${
                !isLocalVideoEnabled ? 'pi-hidden' : ''
              }`}
            ></video>
            {/* small local video placeholder */}
            <div
              className={`pi-w-32 pi-h-24 pi-absolute pi-top-5 pi-right-5 pi-rounded-lg pi-bg-gray-200 dark:pi-bg-gray-900 pi-flex pi-items-center pi-justify-center ${
                isLocalVideoEnabled || !hasVideoTrackAdded ? 'pi-hidden' : ''
              }`}
            >
              <div className='pi-rounded-full pi-bg-gray-700 dark:pi-bg-gray-200 pi-w-12 pi-h-12 pi-flex pi-items-center pi-justify-center'>
                <span className='pi-text-base pi-text-gray-50 dark:pi-text-gray-900'>
                  {getInitials(userInfo.name || '-')}
                </span>
              </div>
            </div>
            {/* small remote video */}
            <video
              muted={true}
              autoPlay
              ref={smallRemoteVideo}
              className={`pi-max-w-32 pi-max-h-32 pi-absolute pi-top-32 pi-right-5 pi-rounded-lg ${
                !screenShareActive || showRemoteVideoPlaceHolder ? 'pi-hidden' : ''
              }`}
            ></video>
            {/* small remote video placeholder */}
            <div
              className={`pi-w-32 pi-h-24 pi-absolute pi-top-32 pi-right-5 pi-rounded-lg pi-bg-gray-200 dark:pi-bg-gray-900 pi-flex pi-items-center pi-justify-center ${
                !screenShareActive || !showRemoteVideoPlaceHolder || !hasVideoTrackAdded
                  ? 'pi-hidden'
                  : ''
              }`}
            >
              <div className='pi-rounded-full pi-bg-gray-700 dark:pi-bg-gray-200 pi-w-12 pi-h-12 pi-flex pi-items-center pi-justify-center'>
                <span className='pi-text-base pi-text-gray-50 dark:pi-text-gray-900'>
                  {getInitials(displayName)}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`${
              !isUiShown && 'pi-opacity-0 pi-pointer-events-none'
            } pi-absolute pi-bottom-0 pi-bg-gray-950/65 pi-w-full pi-p-6 pi-rounded-bl-3xl pi-rounded-br-3xl pi-transition-all`}
          >
            <div className='pi-flex pi-items-center pi-justify-center pi-gap-6 pi-mb-5'>
              {/* mute button */}
              {!intrudeListenStatus?.isListen && (
                <Button
                  variant='default'
                  active={muted ? true : false}
                  onClick={() => (muted ? unmuteCurrentCall() : muteCurrentCall())}
                  data-tooltip-id='tooltip-mute'
                  data-tooltip-content={muted ? `${t('Tooltip.Unmute')}` : `${t('Tooltip.Mute')}`}
                >
                  {muted ? (
                    <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faMicrophoneSlash} />
                  ) : (
                    <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faMicrophone} />
                  )}
                </Button>
              )}

              {/* video button */}
              <Button
                variant='default'
                onClick={() => toggleVideo()}
                data-tooltip-id='tooltip-toggle-video'
                data-tooltip-content={
                  isLocalVideoEnabled ? t('Tooltip.Disable camera') : t('Tooltip.Enable camera')
                }
              >
                {isLocalVideoEnabled ? (
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faVideo} />
                ) : (
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faVideoSlash} />
                )}
              </Button>

              {/* Share screen button */}
              {janus.current.webRTCAdapter.browserDetails.browser !== 'safari' &&
                userInfo?.profile?.macro_permissions?.nethvoice_cti?.permissions?.screen_sharing
                  ?.value &&
                !screenShareActive && (
                  <Button
                    variant='default'
                    onClick={() => eventDispatch('phone-island-screen-share-start', {})}
                    data-tooltip-id='tooltip-start-screen-share'
                    data-tooltip-content={t('Tooltip.Share screen') || ''}
                  >
                    <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faDisplay} />
                  </Button>
                )}

              {/* stop screen share */}
              {screenShareActive && screenShareRole === 'publisher' && (
                <Button
                  variant='default'
                  onClick={() => eventDispatch('phone-island-screen-share-stop', {})}
                  data-tooltip-id='tooltip-stop-screen-share'
                  data-tooltip-content={t('Tooltip.Stop sharing')}
                >
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faDisplaySlash} />
                </Button>
              )}

              <Dropdown
                buttonTooltip={t('Common.More actions')}
                items={[
                  {
                    id: 'fullScreen',
                    label: isFullscreen
                      ? t('Tooltip.Exit fullscreen')
                      : t('Tooltip.Enter fullscreen'),
                    icon: faExpand,
                    onClick: () => toggleFullScreen(),
                  },
                  {
                    id: 'record',
                    label: isRecording ? t('Tooltip.Stop recording') : t('Tooltip.Record'),
                    icon: isRecording ? faStop : faRecord,
                    onClick: () => recordCurrentCall(isRecording),
                  },
                  {
                    id: 'hold',
                    label: paused ? t('Tooltip.Play') : t('Tooltip.Pause'),
                    icon: paused ? faPlay : faPause,
                    onClick: () => (paused ? unpauseCurrentCall() : pauseCall()),
                    disabled: intrudeListenStatus?.isIntrude || intrudeListenStatus?.isListen,
                  },
                ]}
              />
            </div>
            <Hangup buttonsVariant='default' />
          </div>
          {/* Buttons tooltips */}
          <CustomThemedTooltip className='pi-z-20' id='tooltip-mute' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-toggle-video' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-toggle-fullscreen' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-start-screen-share' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-stop-screen-share' place='bottom' />
          <CustomThemedTooltip
            className='pi-z-20'
            id='tooltip-screen-share-record'
            place='bottom'
          />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-pause' place='bottom' />
        </div>
      ) : (
        // collapsed view
        <>
          <div className='pi-flex pi-justify-between pi-items-center'>
            <Avatar />
            <Timer startTime={startTime} isHome />
            {!isOpen && remoteAudioStream && !isPhysical() && (
              <AudioBars
                audioStream={remoteAudioStream}
                paused={paused}
                size={isOpen ? 'large' : 'small'}
              />
            )}
          </div>
        </>
      )}
    </>
  )
}

export default VideoView
