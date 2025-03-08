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
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import {
  eventDispatch,
  getJSONItem,
  useEventListener,
  useIsomorphicLayoutEffect,
} from '../../utils'
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
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isUiShown, setUiShown] = useState(false)
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const screenShareViewRef = useRef(null)
  const janus = useRef<JanusTypes>(JanusLib)

  ////
  // useIsomorphicLayoutEffect(() => {
  //   dispatch.player.updatePlayer({
  //     localVideo: localVideo,
  //     remoteVideo: remoteVideo,
  //   })
  // }, [])

  // component did mount
  useEffect(() => {
    // updateVideoStreams() ////

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

  const initScreenShare = () => {
    janus.current.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: janus.current.randomString(32),
      success: function (pluginHandle) {
        // Set plugin to the store
        dispatch.webrtc.updateWebRTC({
          screenShare: pluginHandle,
        })
        console.log('aa videoroom plugin attached') ////

        //// preShareScreen()
      },
      error: function (error) {
        if (janus.current.error) {
          janus.current.error('Error attaching videoroom plugin', error)
        }
      },
      consentDialog: function (on) {
        console.log('aa consentDialog, on?', on) ////
        //// ?
      },
      iceState: function (state) {
        if (janus.current.log) {
          janus.current.log('ICE state changed to ' + state)
        }
      },
      mediaState: function (medium, on) {
        if (janus.current.log) {
          janus.current.log('Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium)
        }
      },
      webrtcState: function (on) {
        if (janus.current.log) {
          janus.current.log(
            'Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now',
          )
        }
        //// TODO see screensharingtest.js:106
      },
      onmessage: function (msg, jsep) {
        if (janus.current.debug) {
          janus.current.debug(' ::: Got a message (publisher) :::', msg)
        }
        const { screenShare }: { screenShare: any } = store.getState().webrtc
        const event = msg['videoroom']
        if (janus.current.debug) {
          janus.current.debug('Event: ' + event)
        }
        if (event) {
          if (event === 'joined') {
            ////
          } else if (event === 'event') {
            ////
          }
        }
        if (jsep) {
          if (janus.current.debug) {
            janus.current.debug('Handling SDP as well...', jsep)
          }
          screenShare.handleRemoteJsep({ jsep: jsep })
        }
        //// onlocalstream: function(stream) {
      },
    })
  }

  ////
  // const updateVideoStreams = () => {
  //   const localVideoElement = store.getState().player.localVideo
  //   const remoteVideoElement = store.getState().player.remoteVideo
  //   const { localVideoStream, remoteVideoStream } = store.getState().webrtc

  //   // local video stream

  //   if (localVideoElement?.current) {
  //     if (janus.current.attachMediaStream) {
  //       janus.current.attachMediaStream(localVideoElement.current, localVideoStream as MediaStream)
  //     }
  //   }

  //   // remote video stream

  //   if (remoteVideoElement?.current) {
  //     if (janus.current.attachMediaStream) {
  //       janus.current.attachMediaStream(
  //         remoteVideoElement.current,
  //         remoteVideoStream as MediaStream,
  //       )
  //     }
  //   }
  // }

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

              {/* video button */}
              <Button
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
              </Button>

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
