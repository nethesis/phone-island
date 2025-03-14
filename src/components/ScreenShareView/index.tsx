// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircle,
  faCircleDot,
  faExpand,
  faMicrophone,
  faMicrophoneSlash,
  faPause,
  faPlay,
  faStop,
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
import { JanusTypes } from '../../types/webrtc'
import JanusLib from '../../lib/webrtc/janus.js'
import Avatar from '../CallView/Avatar'
import Timer from '../CallView/Timer'
import { isPhysical } from '../../lib/user/default_device'
import { AudioBars } from '../AudioBars'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { faDisplaySlash } from '@nethesis/nethesis-solid-svg-icons'

//// review

export interface ScreenShareViewProps {}

export type ScreenSharingMessage = {
  message: 'screenSharingStart' | 'screenSharingStop'
  roomId: string
  destUser: string
  callUser: string
}

export const ScreenShareView: FC<ScreenShareViewProps> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { muted, startTime, isRecording, paused } = useSelector(
    (state: RootState) => state.currentCall,
  )
  const { source, localTracks, localVideos, role } = useSelector(
    (state: RootState) => state.screenShare,
  )
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { janusInstance, remoteAudioStream } = useSelector((state: RootState) => state.webrtc)
  const { username } = store.getState().currentUser
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isUiShown, setUiShown] = useState(false)
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const screenShareViewRef = useRef(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)
  const janus = useRef<JanusTypes>(JanusLib) //// fix error

  useIsomorphicLayoutEffect(() => {
    dispatch.player.updatePlayer({
      localVideo: localVideo,
      remoteVideo: remoteVideo,
    })
  }, [])

  // component did mount
  useEffect(() => {
    updateScreenStreams()

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
    updateScreenStreams() //// needed?
  }, [isOpen])

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
    console.log('aa newRemoteFeed', id, display) //// needed?

    //// review function

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
        // bootbox.alert('Error attaching plugin... ' + error) ////
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
            ////
            // $('#screenmenu').addClass('hide')
            // $('#room').removeClass('hide')
          } else {
            // What has just happened? ////
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
              // bootbox.alert('WebRTC error... ' + error.message) ////
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

          console.log('aaaa ignoring mute, return') ////

          return
        }
        if (!on) {
          // Track removed, get rid of the stream and the rendering
          ////
          // $('#screenvideo' + mid).remove()
          // if (track.kind === 'video') {
          //   remoteVideos--
          //   if (remoteVideos === 0) {
          //     // No video, at least for now: show a placeholder
          //     if ($('#screencapture .no-video-container').length === 0) {
          //       $('#screencapture').append(
          //         '<div class="no-video-container">' +
          //           '<i class="fa-solid fa-video fa-xl no-video-icon"></i>' +
          //           '<span class="no-video-text">No remote video available</span>' +
          //           '</div>',
          //       )
          //     }
          //   }
          // }
          // delete remoteTracks[mid]

          //// added by us
          const { remoteScreenStream } = store.getState().screenShare
          janus.current.stopAllTracks(remoteScreenStream)

          console.log('aaaa stopped remote stream') ////

          return
        }
        // If we're here, a new track was added
        if (track.kind === 'audio') {
          //// audio is already handled by sip, shouldn't be needed here
          // New audio track: create a stream out of it, and use a hidden <audio> element
          ////
          // let stream = new MediaStream([track])
          // remoteTracks[mid] = stream
          // janus.current.log?.('Created remote audio stream:', stream)
          // $('#screencapture').append(
          //   '<audio class="hide" id="screenvideo' + mid + '" playsinline/>',
          // )
          // $('#screenvideo' + mid).get(0).volume = 0
          // Janus.attachMediaStream($('#screenvideo' + mid).get(0), stream)
          // $('#screenvideo' + mid)
          //   .get(0)
          //   .play()
          // $('#screenvideo' + mid).get(0).volume = 1
          // if (remoteVideos === 0) {
          //   // No video, at least for now: show a placeholder
          //   if ($('#screencapture .no-video-container').length === 0) {
          //     $('#screencapture').append(
          //       '<div class="no-video-container">' +
          //         '<i class="fa-solid fa-video fa-xl no-video-icon"></i>' +
          //         '<span class="no-video-text">No remote video available</span>' +
          //         '</div>',
          //     )
          //   }
          // }
        } else {
          // New video track: create a stream out of it

          // remoteVideos++ //// needed?

          ////
          // $('#screencapture .no-video-container').remove()
          let stream = new MediaStream([track])

          // Save the new video stream to the store
          store.dispatch.screenShare.update({ remoteScreenStream: stream })

          remoteFeed.remoteTracks[mid] = stream
          janus.current.log?.('Created remote video stream: ' + stream)

          ////
          // $('#screencapture').append(
          //   '<video class="rounded centered" id="screenvideo' + mid + '" width=100% playsinline/>',
          // )
          // $('#screenvideo' + mid).get(0).volume = 0

          console.log('aaaa attach remote stream') ////

          const remoteScreenElement = store.getState().player.remoteVideo

          console.log('aaaa remoteScreenElement', remoteScreenElement?.current) ////

          if (remoteScreenElement?.current) {
            janus.current.attachMediaStream?.(remoteScreenElement.current, stream)

            console.log('aaaa remote screen attached') ////
          }

          ////
          // Janus.attachMediaStream($('#screenvideo' + mid).get(0), stream)
          // $('#screenvideo' + mid)
          //   .get(0)
          //   .play()
          // $('#screenvideo' + mid).get(0).volume = 1
        }
      },
      oncleanup: function () {
        janus.current.log?.(' ::: Got a cleanup notification (remote feed ' + id + ') :::')

        // $('#waitingvideo').remove() ////

        remoteFeed.remoteTracks = {}
        remoteFeed.remoteVideos = 0
      },
    })
  }

  ////
  // const preShareScreen = () => {
  //   console.log('aa preShareScreen') ////

  //   if (!janus.current.isExtensionEnabled()) {
  //     janus.current.error?.(
  //       "This browser doesn't support screensharing (getDisplayMedia unavailable)",
  //     )
  //     return
  //   }
  //   // capture = "screen"; //// needed?
  //   shareScreen()
  // }

  const shareScreen = () => {
    console.log('aa shareScreen') ////

    if (!janus.current.isExtensionEnabled()) {
      janus.current.error?.(
        "This browser doesn't support screensharing (getDisplayMedia unavailable)",
      )
      return
    }
    // capture = "screen"; //// needed?

    // Create a new room

    // Set role to the store
    // dispatch.screenShare.update({
    //   role: 'publisher',
    // })

    const roomName = janus.current.randomString(32)

    let create = {
      request: 'create',
      description: roomName,
      bitrate: 500000,
      publishers: 1,
    }

    // console.log('plugin', plugin) ////

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

          // const roomUser = janus.current.randomString(12) ////
          let register = {
            request: 'join',
            room: room,
            ptype: 'publisher',
            display: username,
          }
          plugin.send({ message: register })

          // send message to websocket to invite the other user
          const { socket } = store.getState().websocket

          console.log('aa socket', socket) ////

          const { username: destUsername } = store.getState().currentCall

          socket.emit('message', {
            message: 'screenSharingStart',
            roomId: room,
            destUser: destUsername,
            callUser: username,
          } as ScreenSharingMessage)

          console.log('aa screenSharingStart emitted') ////
        }
      },
    })
  }

  const initScreenShare = () => {
    console.log('aa initScreenShare, janusInstance', janusInstance) ////

    janusInstance?.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: janus.current.randomString(32),
      success: function (pluginHandle) {
        console.log('aa videoroom plugin attached:', pluginHandle) ////

        // Set plugin to the store
        dispatch.screenShare.update({
          plugin: pluginHandle,
        })

        //// call shareScreen() or joinScreenShare() based on role

        const { role } = store.getState().screenShare

        console.log('aaaa role', role) ////

        if (role === 'publisher') {
          shareScreen()
        } else if (role === 'listener') {
          joinScreenShare()
        }
      },
      error: function (error) {
        janus.current.error?.('Error attaching videoroom plugin', error)
      },
      consentDialog: function (on) {
        console.log('aa consentDialog, on?', on) ////
        //// ?
      },
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
        //// TODO see janus screensharing.js:97
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

        console.log('aa onmessage', msg) ////

        // const { plugin, role, source, localTracks } = store.getState().screenShare ////
        const { plugin, role } = store.getState().screenShare
        const event = msg['videoroom']
        janus.current.debug?.('Event: ' + event)

        if (event) {
          if (event === 'joined') {
            console.log('aa event joined, role', role) ////

            if (role === 'publisher') {
              // This is our session, publish our stream
              janus.current.debug?.('Negotiating WebRTC stream for our screen')

              // Safari expects a user gesture to share the screen: see issue #2455 //// TODO needed?

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
            console.log('aa event "event"') ////

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
              if (role === 'listener' && msg['leaving'] === source) {
                // bootbox.alert( ////
                //   'The screen sharing session is over, the publisher left',
                //   function () {
                //     window.location.reload()
                //   },
                // )
              }
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
            ////
            // $('#screenvideo' + trackId).remove()
            // localVideos--
            // if (localVideos === 0) {
            //   // No video, at least for now: show a placeholder
            //   if ($('#screencapture .no-video-container').length === 0) {
            //     $('#screencapture').append(
            //       '<div class="no-video-container">' +
            //         '<i class="fa-solid fa-video fa-xl no-video-icon"></i>' +
            //         '<span class="no-video-text">No webcam available</span>' +
            //         '</div>',
            //     )
            //   }
            // }
          }

          ////
          // delete localTracks[trackId]

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
        ////
        // $('#screenmenu').addClass('hide')
        // $('#room').removeClass('hide')

        if (track.kind === 'audio') {
          // We ignore local audio tracks, they'd generate echo anyway
          if (localVideos === 0) {
            // No video, at least for now: show a placeholder
            ////
            // if ($('#screencapture .no-video-container').length === 0) {
            //   $('#screencapture').append(
            //     '<div class="no-video-container">' +
            //       '<i class="fa-solid fa-video fa-xl no-video-icon"></i>' +
            //       '<span class="no-video-text">No webcam available</span>' +
            //       '</div>',
            //   )
            // }
          }
        } else {
          // New video track: create a stream out of it
          dispatch.screenShare.update({
            localVideos: localVideos + 1,
          })
          // $('#screencapture .no-video-container').remove() ////
          let stream = new MediaStream([track])

          // Save the new video stream to the store
          store.dispatch.screenShare.update({
            localScreenStream: stream,
          })

          ////
          // localTracks[trackId] = stream
          // dispatch.screenShare.update({ ////
          //   localTracks: { ...localTracks, [trackId]: stream },
          // })

          janus.current.log?.('Created local stream: ' + stream)
          ////
          // $('#screencapture').append(
          //   '<video class="rounded centered" id="screenvideo' +
          //     trackId +
          //     '" width=100% autoplay playsinline muted="muted"/>',
          // )

          const localScreenElement = store.getState().player.localVideo

          console.log('aaaa attach local stream') ////

          if (localScreenElement?.current) {
            janus.current.attachMediaStream?.(localScreenElement.current, stream)

            console.log('aaaa attached local 1') ////
          }
        }
        const { plugin } = store.getState().screenShare

        if (
          plugin.webrtcStuff.pc.iceConnectionState !== 'completed' &&
          plugin.webrtcStuff.pc.iceConnectionState !== 'connected'
        ) {
          ////
          // $('#screencapture')
          //   .parent()
          //   .parent()
          //   .block({
          //     message: '<b>Publishing...</b>',
          //     css: {
          //       border: 'none',
          //       backgroundColor: 'transparent',
          //       color: 'white',
          //     },
          //   })
        }
      },
      // eslint-disable-next-line no-unused-vars
      onremotetrack: function (track, mid, on) {
        // The publisher stream is sendonly, we don't expect anything here

        console.log('aa onremotetrack', track, mid, on) ////
      },
      oncleanup: function () {
        janus.current.log?.(' ::: Got a cleanup notification :::')
        ////
        // $('#screencapture').empty()
        // $('#screencapture').parent().unblock()
        // $('#room').addClass('hide')
        // localTracks = {}
        // localVideos = 0

        dispatch.screenShare.update({
          localTracks: {},
          localVideos: 0,
        })
      },
    })
  }

  ////
  const updateScreenStreams = () => {
    const localScreenElement = store.getState().player.localVideo
    const remoteScreenElement = store.getState().player.remoteVideo
    const { localScreenStream, remoteScreenStream } = store.getState().screenShare

    // local screen stream

    if (localScreenElement?.current) {
      if (janus.current.attachMediaStream) {
        janus.current.attachMediaStream(
          localScreenElement.current,
          localScreenStream as MediaStream,
        )

        console.log('aaaa attached local 1') ////
      }
    }

    // remote screen stream

    if (remoteScreenElement?.current) {
      if (janus.current.attachMediaStream) {
        janus.current.attachMediaStream(
          remoteScreenElement.current,
          remoteScreenStream as MediaStream,
        )

        console.log('aaaa attached remote 1') ////
      }
    }
  }

  const initAndStartScreenShare = () => {
    console.log('aa enableScreenShare') ////

    dispatch.screenShare.update({ role: 'publisher' })
    initScreenShare()
  }
  useEventListener('phone-island-screen-share-start', () => {
    initAndStartScreenShare()
  })

  const initAndJoinScreenShare = (joinData: ScreenSharingMessage) => {
    console.log('aa joining Screen Share', joinData) ////

    dispatch.screenShare.update({ role: 'listener' })
    dispatch.screenShare.update({ room: joinData.roomId })
    initScreenShare()

    //// needed?
    // eventDispatch('phone-island-screen-share-joined', {})
  }
  useEventListener('phone-island-screen-share-joining', (data: ScreenSharingMessage) => {
    initAndJoinScreenShare(data)
  })

  const joinScreenShare = () => {
    console.log('aa joinScreenShare') ////

    const { room } = store.getState().screenShare

    console.log('aaaa join room', room) ////

    const joinMessage = {
      request: 'join',
      room: room,
      ptype: 'publisher', //// 'publisher' or 'listener'?
      display: username,
    }

    const { plugin } = store.getState().screenShare
    plugin.send({ message: joinMessage })
  }

  const leaveScreenShare = (leaveData: ScreenSharingMessage) => {
    console.log('aa leaving Screen Share', leaveData) ////

    const { remoteScreenStream } = store.getState().screenShare
    janus.current.stopAllTracks(remoteScreenStream)
    dispatch.island.setIslandView('call')

    //// needed?
    // eventDispatch('phone-island-screen-share-leaved', {})
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
    console.log('aa stopScreenShare') ////

    const { localScreenStream } = store.getState().screenShare

    janus.current.stopAllTracks(localScreenStream)

    console.log('aa stopped all local tracks') ////

    // send message to websocket to tell the other user the screen share has stopped
    const { socket } = store.getState().websocket
    const { username: destUsername } = store.getState().currentCall
    const { room } = store.getState().screenShare

    console.log('aa stopping share for room: ', room) ////

    socket.emit('message', {
      message: 'screenSharingStop',
      roomId: room,
      destUser: destUsername,
      callUser: username,
    } as ScreenSharingMessage)

    dispatch.island.setIslandView('call')
  }

  const pauseCall = () => {
    pauseCurrentCall()
    stopScreenShare()
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
            {/* remote video */}
            {role === 'listener' && (
              <video
                autoPlay
                muted={true}
                ref={remoteVideo}
                className='pi-rounded-2xl pi-w-full pi-h-full'
              ></video>
            )}
            {/* local video */}
            {role === 'publisher' && (
              <video
                autoPlay
                muted={true}
                ref={localVideo}
                className='pi-rounded-2xl pi-w-full pi-h-full'
              ></video>
            )}
            {/* <video //// 
              muted={true}
              autoPlay
              ref={localVideo}
              className='pi-w-1/2 pi-h-1/2 pi-absolute pi-top-5 pi-right-5 pi-rounded-lg'
            ></video> */}
            {/* //// remove */}
            <div className='pi-absolute pi-top-5 pi-left-5 pi-text-gray-500'>Role: {role}</div>
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

              {/* //// todo tooltip */}
              {/* screen share button */}
              {/* <Button
                variant='default'
                onClick={() => initScreenShare()}
                data-tooltip-id='tooltip-toggle-video'
                data-tooltip-content={'Screen share //// '}
              >
                <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faDisplay} />
              </Button> */}

              {/* video button */}
              {/* <Button //// 
                variant='default'
                onClick={() => toggleVideo()}
                data-tooltip-id='tooltip-toggle-video'
                data-tooltip-content={
                  isVideoEnabled ? t('Tooltip.Disable camera') : t('Tooltip.Enable camera')
                }
              >
                {isVideoEnabled ? (
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faVideo} />
                ) : (
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faVideoSlash} />
                )}
              </Button> */}

              {/* fullscreen */}
              <Button
                variant='default'
                onClick={() => toggleFullScreen()}
                data-tooltip-id='tooltip-toggle-fullscreen'
                data-tooltip-content={
                  isFullscreen ? t('Tooltip.Exit fullscreen') : t('Tooltip.Enter fullscreen')
                }
              >
                <FontAwesomeIcon icon={faExpand} className='pi-h-6 pi-w-6' />
              </Button>

              {/* stop screen share */}
              {/* //// todo show only while presenting */}
              {/* //// todo tooltip content */}
              {role === 'publisher' && (
                <Button
                  variant='default'
                  onClick={() => stopScreenShare()}
                  data-tooltip-id='tooltip-stop-screen-share'
                  data-tooltip-content={t('Tooltip.Stop sharing')}
                >
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faDisplaySlash} />
                </Button>
              )}

              {/* record */}
              <Button
                active={isRecording}
                data-stop-propagation={true}
                variant='default'
                onClick={() => recordCurrentCall(isRecording)}
                data-tooltip-id='tooltip-record'
                data-tooltip-content={
                  isRecording ? t('Tooltip.Stop recording') || '' : t('Tooltip.Record') || ''
                }
              >
                {isRecording ? (
                  <FontAwesomeIcon icon={faStop} className='pi-h-6 pi-w-6' />
                ) : (
                  <div className='custom-circle-dot-wrapper' data-stop-propagation={true}>
                    <FontAwesomeIcon
                      icon={faCircleDot}
                      className='fa-circle-dot pi-text-white dark:pi-text-red-700'
                    />
                    <FontAwesomeIcon
                      icon={faCircle}
                      className='inner-dot pi-text-red-700 dark:pi-text-white'
                    />
                  </div>
                )}
              </Button>

              {/* hold */}
              {!(intrudeListenStatus?.isIntrude || intrudeListenStatus?.isListen) && (
                <Button
                  variant='default'
                  active={paused ? true : false}
                  onClick={() => (paused ? unpauseCurrentCall() : pauseCall())}
                  data-tooltip-id='tooltip-pause'
                  data-tooltip-content={paused ? `${t('Tooltip.Play')}` : `${t('Tooltip.Pause')}`}
                >
                  {paused ? (
                    <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPlay} />
                  ) : (
                    <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPause} />
                  )}
                </Button>
              )}
            </div>
            <Hangup buttonsVariant='default' />
          </div>
          {/* Buttons tooltips */}
          <CustomThemedTooltip className='pi-z-20' id='tooltip-mute' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-toggle-video' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-toggle-fullscreen' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-stop-screen-share' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-record' place='bottom' />
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

export default ScreenShareView
