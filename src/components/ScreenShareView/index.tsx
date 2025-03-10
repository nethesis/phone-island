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
  faDisplay,
  faExpand,
  faMicrophone,
  faMicrophoneSlash,
  faPause,
  faPlay,
  faStop,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { eventDispatch, useEventListener } from '../../utils'
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
import { Tooltip } from 'react-tooltip'

//// review

export interface ScreenShareViewProps {}

export const ScreenShareView: FC<ScreenShareViewProps> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { muted, startTime, isRecording, paused, isVideoEnabled } = useSelector(
    (state: RootState) => state.currentCall,
  )
  const { plugin, role, source, localTracks, localVideos } = useSelector(
    (state: RootState) => state.screenShare,
  )
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isUiShown, setUiShown] = useState(false)
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const screenShareViewRef = useRef(null)
  const janus = useRef<JanusTypes>(JanusLib) //// fix error

  ////
  // useIsomorphicLayoutEffect(() => {
  //   dispatch.player.updatePlayer({
  //     localVideo: localVideo,
  //     remoteVideo: remoteVideo,
  //   })
  // }, [])

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
  // useEffect(() => {
  //   updateVideoStreams() //// needed?
  // }, [isOpen])

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
  }

  const preShareScreen = () => {
    if (!janus.current.isExtensionEnabled()) {
      janus.current.error?.(
        "This browser doesn't support screensharing (getDisplayMedia unavailable)",
      )
      return
    }
    // capture = "screen"; //// needed?
    shareScreen()
  }

  const shareScreen = () => {
    console.log('aa shareScreen') ////

    // const { plugin }: { plugin: any } = store.getState().screenShare ////

    // Create a new room

    // Set role to the store

    const roomName = janus.current.randomString(32)

    let create = {
      request: 'create',
      description: roomName,
      bitrate: 500000,
      publishers: 1,
    }
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
          const username = janus.current.randomString(12)
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
    console.log('aa initScreenShare') ////

    janus.current.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: janus.current.randomString(32),
      success: function (pluginHandle) {
        // Set plugin to the store
        dispatch.screenShare.update({
          plugin: pluginHandle,
        })
        console.log('aa videoroom plugin attached') ////

        //// call this only if we are the publisher
        preShareScreen()
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
        //// TODO see screensharingtest.js:97
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
        // const { plugin, role, source, localTracks } = store.getState().screenShare ////
        const event = msg['videoroom']
        janus.current.debug?.('Event: ' + event)

        if (event) {
          if (event === 'joined') {
            if (role === 'publisher') {
              // This is our session, publish our stream
              janus.current.debug?.('Negotiating WebRTC stream for our screen')
              // Safari expects a user gesture to share the screen: see issue #2455 //// needed?
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

          const localScreenElement = store.getState().player.localScreen

          if (localScreenElement?.current) {
            janus.current.attachMediaStream?.(localScreenElement.current, stream)
          }
        }
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
    const localScreenElement = store.getState().player.localScreen
    // const remoteVideoElement = store.getState().player.remoteVideo //// uncomment?
    const { localScreenStream } = store.getState().screenShare

    // local video stream

    if (localScreenElement?.current) {
      if (janus.current.attachMediaStream) {
        janus.current.attachMediaStream(
          localScreenElement.current,
          localScreenStream as MediaStream,
        )
      }
    }

    // remote video stream

    //// remove?
    // if (remoteVideoElement?.current) {
    //   if (janus.current.attachMediaStream) {
    //     janus.current.attachMediaStream(
    //       remoteVideoElement.current,
    //       remoteVideoStream as MediaStream,
    //     )
    //   }
    // }
  }

  const enableScreenShare = () => {
    console.log('aa enableScreenShare') ////

    initScreenShare()
  }
  useEventListener('phone-island-screen-share-enable', () => {
    enableScreenShare()
  })

  ////
  // const enableVideo = (data) => {
  //   const { sipcall }: { sipcall: any } = store.getState().webrtc
  //   store.dispatch.currentCall.setVideoEnabled(true)
  //   const tracks: JanusTrack[] = []

  //   // use current video input device from localstorage
  //   let currentVideoDeviceInputId = getJSONItem('phone-island-video-input-device').deviceId || null

  //   const track: Partial<JanusTrack> = {
  //     type: 'video',
  //     recv: true,
  //   }

  //   if (currentVideoDeviceInputId) {
  //     track.capture = { deviceId: { exact: currentVideoDeviceInputId } }
  //   } else {
  //     track.capture = true
  //   }

  //   if (data.addVideoTrack) {
  //     // add video track
  //     track.add = true
  //   } else {
  //     // replace video track (video track has been previously added and removed)
  //     track.replace = true
  //     track.mid = '1'
  //   }
  //   tracks.push(track as JanusTrack)

  //   sipcall.createOffer({
  //     tracks: tracks,
  //     success: function (jsep) {
  //       sipcall.send({ message: { request: 'update' }, jsep: jsep })
  //       eventDispatch('phone-island-video-enabled', {})
  //     },
  //     error: function (error) {
  //       console.error('WebRTC error... ' + JSON.stringify(error))
  //     },
  //   })
  // }
  // useEventListener('phone-island-video-enable', (data) => {
  //   enableVideo(data)
  // })

  ////
  // const disableVideo = () => {
  //   const { sipcall }: { sipcall: any } = store.getState().webrtc
  //   store.dispatch.currentCall.setVideoEnabled(false)
  //   const tracks: JanusTrack[] = []
  //   tracks.push({ type: 'video', mid: '1', remove: true })

  //   sipcall.createOffer({
  //     tracks: tracks,
  //     success: function (jsep) {
  //       sipcall.send({ message: { request: 'update' }, jsep: jsep })
  //       eventDispatch('phone-island-video-disabled', {})
  //     },
  //     error: function (error) {
  //       console.error('WebRTC error... ' + JSON.stringify(error))
  //     },
  //   })
  // }
  // useEventListener('phone-island-video-disable', () => {
  //   disableVideo()
  // })

  ////
  // const toggleVideo = () => {
  //   if (isVideoEnabled) {
  //     disableVideo()
  //   } else {
  //     enableVideo({ addVideoTrack: false })
  //   }
  // }

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

  return (
    <>
      {isOpen ? (
        <div
          ref={screenShareViewRef}
          onMouseMove={() => handleMouseMoveWithDebounce()}
          className={isFullscreen ? 'pi-h-screen' : 'pi-h-[480px]'}
        >
          <div className={`pi-flex pi-h-full pi-relative pi-justify-center`}>
            screen share ////
            {/* remote video */}
            {/* <video autoPlay muted={true} ref={remoteVideo} className='pi-rounded-2xl'></video> ////  */}
            {/* local video */}
            {/* <video //// 
              muted={true}
              autoPlay
              ref={localVideo}
              className='pi-max-w-32 pi-max-h-32 pi-absolute pi-top-5 pi-right-5 pi-rounded-lg'
            ></video> */}
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
                  onClick={() => (paused ? unpauseCurrentCall() : pauseCurrentCall())}
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
          <Tooltip className='pi-z-20' id='tooltip-mute' place='bottom' />
          <Tooltip className='pi-z-20' id='tooltip-toggle-video' place='bottom' />
          <Tooltip className='pi-z-20' id='tooltip-toggle-fullscreen' place='bottom' />
          <Tooltip className='pi-z-20' id='tooltip-record' place='bottom' />
          <Tooltip className='pi-z-20' id='tooltip-pause' place='bottom' />
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
