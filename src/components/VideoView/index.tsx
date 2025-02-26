// Copyright (C) 2024 Nethesis S.r.l.
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
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { eventDispatch, useIsomorphicLayoutEffect } from '../../utils'
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
import { Tooltip } from 'react-tooltip'
import TransferButton from '../TransferButton'

export interface VideoViewProps {}

export const VideoView: FC<VideoViewProps> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { muted, startTime, isRecording, paused, isVideoEnabled } = useSelector(
    (state: RootState) => state.currentCall,
  )
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)
  const { variants } = useSelector((state: RootState) => state.motions)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoViewRef = useRef(null)
  const audioPlayer = useRef<HTMLAudioElement>(null)
  const localAudio = useRef<HTMLAudioElement>(null)
  const remoteAudio = useRef<HTMLAudioElement>(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)
  const janus = useRef<JanusTypes>(JanusLib)

  useIsomorphicLayoutEffect(() => {
    dispatch.player.updatePlayer({
      audioPlayer: audioPlayer,
      localAudio: localAudio,
      localVideo: localVideo,
      remoteVideo: remoteVideo,
      remoteAudio: remoteAudio,
    })
  }, [])

  // component did mount
  useEffect(() => {
    updateVideoStreams()

    // register for full screen change
    addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // isOpen changed
  useEffect(() => {
    console.log('## isOpen changed', isOpen) ////

    updateVideoStreams()
  }, [isOpen])

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement)
  }

  const toggleFullScreen = () => {
    // const elem = document.getElementById('video-view') ////

    if (document.fullscreenElement) {
      // exit full screen
      document.exitFullscreen()
    } else {
      // enter full screen
      if (videoViewRef.current) {
        ;(videoViewRef.current as HTMLElement).requestFullscreen()
      }
    }
  }

  const updateVideoStreams = () => {
    const localVideoElement = store.getState().player.localVideo
    const remoteVideoElement = store.getState().player.remoteVideo

    const { localVideoStream, remoteVideoStream } = store.getState().webrtc

    // local video stream

    if (localVideoElement?.current) {
      console.log(
        '## attached! localVideoElement.current',
        localVideoElement.current,
        'localVideoStream',
        localVideoStream,
      ) ////

      if (janus.current.attachMediaStream) {
        janus.current.attachMediaStream(localVideoElement.current, localVideoStream as MediaStream)
      }
    }

    //// remote video stream

    if (remoteVideoElement?.current) {
      console.log(
        '## attached! remoteVideoElement.current',
        remoteVideoElement.current,
        'remoteVideoStream',
        remoteVideoStream,
      ) ////

      if (janus.current.attachMediaStream) {
        janus.current.attachMediaStream(
          remoteVideoElement.current,
          remoteVideoStream as MediaStream,
        )
      }
    }
  }

  const toggleVideo = () => {
    // const { isVideoEnabled } = store.getState().currentCall ////
    store.dispatch.currentCall.setVideoEnabled(!isVideoEnabled)
    eventDispatch('phone-island-toggle-video', { enableVideo: !isVideoEnabled })
  }

  return (
    <>
      {isOpen ? (
        <div ref={videoViewRef}>
          <div
            className={`pi-flex pi-relative pi-justify-center ${
              isFullscreen ? 'pi-h-screen' : `pi-h-[${variants.video.expanded.height}px]`
            } `}
          >
            {/* remote video */}
            <video autoPlay muted={true} ref={remoteVideo} className='pi-rounded-2xl'></video>
            {/* local video */}
            <video
              muted={true}
              autoPlay
              ref={localVideo}
              className='pi-max-w-32 pi-max-h-32 pi-absolute pi-top-5 pi-right-5 pi-rounded-lg'
            ></video>
          </div>

          <div className='pi-absolute pi-bottom-0 pi-bg-gray-950/65 pi-w-full pi-p-6 pi-rounded-bl-3xl pi-rounded-br-3xl'>
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

              {/* //// remove button? */}
              {/* video button */}
              <Button
                variant='default'
                onClick={() => toggleVideo()}
                data-tooltip-id='tooltip-toggle-video'
                data-tooltip-content={
                  isVideoEnabled ? t('Tooltip.Disable camera') : t('Tooltip.Enable camera')
                }
              >
                <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faVideo} />
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

              {/* transfer */}
              <TransferButton />
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

export default VideoView
