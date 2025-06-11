// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCompress,
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
import { getInitials } from '../../lib/avatars/avatars'

export interface StreamingAnswerViewProps {}

export const StreamingAnswerView: FC<StreamingAnswerViewProps> = () => {
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
    isStartingVideoCall,
    streamingSourceNumber,
  } = useSelector((state: RootState) => state.currentCall)
  const { role: screenShareRole, active: screenShareActive } = useSelector(
    (state: RootState) => state.screenShare,
  )
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { janusInstance, remoteAudioStream } = useSelector((state: RootState) => state.webrtc)
  const { videoSources, sourceImages } = useSelector((state: RootState) => state.streaming)
  const userInfo = store.getState().currentUser

  // Get streaming source image
  const streamingSourceImage = React.useMemo(() => {
    if (!streamingSourceNumber || !videoSources) return null

    const source = Object.values(videoSources).find(
      (source) => source.extension === streamingSourceNumber,
    )
    if (!source) return null

    return sourceImages[source.id] || source.image || null
  }, [streamingSourceNumber, videoSources, sourceImages])

  const [isFullscreen, setIsFullscreen] = useState(false)
  const screenShareViewRef = useRef(null)
  const localScreen = useRef<HTMLVideoElement>(null)
  const remoteScreen = useRef<HTMLVideoElement>(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const largeRemoteVideo = useRef<HTMLVideoElement>(null)
  const smallRemoteVideo = useRef<HTMLVideoElement>(null)

  useIsomorphicLayoutEffect(() => {
    dispatch.player.updatePlayer({
      localScreen: localScreen,
      remoteScreen: remoteScreen,
      localVideo: localVideo,
      largeRemoteVideo: largeRemoteVideo,
      smallRemoteVideo: smallRemoteVideo,
    })
  }, [])

  return (
    <>
      {isOpen ? (
        <div
          ref={screenShareViewRef}
          className={isFullscreen ? 'pi-h-screen' : 'pi-h-[480px] pi-w-[600px]'}
        >
          <div className={`pi-flex pi-relative pi-justify-center pi-w-full pi-h-full`}>
            {/* Streaming source image or placeholder */}
            {streamingSourceImage ? (
              <img
                src={streamingSourceImage}
                alt='Streaming source'
                className='pi-rounded-2xl pi-w-full pi-h-full pi-object-cover'
              />
            ) : (
              <div className='pi-w-full pi-h-full pi-bg-gray-200 dark:pi-bg-gray-800 pi-flex pi-items-center pi-justify-center pi-rounded-2xl'>
                <FontAwesomeIcon
                  icon={faVideoSlash}
                  className='pi-w-24 pi-h-24 pi-text-gray-400 dark:pi-text-gray-600'
                />
              </div>
            )}

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
            {/* small local video */}
            <video
              muted={true}
              autoPlay
              ref={localVideo}
              className={`pi-max-w-32 pi-max-h-32 pi-absolute pi-top-5 pi-right-5 pi-rounded-lg ${
                !isLocalVideoEnabled ? 'pi-hidden' : ''
              }`}
            ></video>
            {/* small remote video */}
            <video
              muted={true}
              autoPlay
              ref={smallRemoteVideo}
              className={`pi-max-w-32 pi-max-h-32 pi-absolute pi-top-32 pi-right-5 pi-rounded-lg ${
                !screenShareActive || showRemoteVideoPlaceHolder ? 'pi-hidden' : ''
              }`}
            ></video>
          </div>

          {/* Top bar */}
          <div className='pi-absolute pi-top-0 pi-left-0 pi-right-0 pi-bg-black/30 pi-p-4 pi-rounded-tl-[20px] pi-rounded-tr-[20px]'>
            <div className='pi-flex pi-items-center pi-justify-between pi-text-white'>
              <div className='pi-flex pi-items-center pi-gap-3'>
                <span className='pi-text-sm pi-font-medium'>{displayName || t('Common.Unknown')}</span>
                <Timer startTime={startTime} isNotAlwaysWhite={false} />
              </div>
              <div className='pi-flex pi-items-center pi-gap-2'>
                {/* Mute button */}
                <Button
                  variant='default'
                  onClick={muted ? unmuteCurrentCall : muteCurrentCall}
                  data-tooltip-id='tooltip-mute-streaming'
                  data-tooltip-content={muted ? t('Tooltip.Unmute') : t('Tooltip.Mute')}
                >
                  <FontAwesomeIcon
                    className='pi-h-5 pi-w-5'
                    icon={muted ? faMicrophoneSlash : faMicrophone}
                  />
                </Button>
                {/* Video toggle button */}
                <Button
                  variant='default'
                  data-tooltip-id='tooltip-toggle-video-streaming'
                  data-tooltip-content={
                    isLocalVideoEnabled ? t('Tooltip.Turn off video') : t('Tooltip.Turn on video')
                  }
                >
                  <FontAwesomeIcon
                    className='pi-h-5 pi-w-5'
                    icon={isLocalVideoEnabled ? faVideo : faVideoSlash}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className='pi-absolute pi-bottom-0 pi-bg-gray-950/65 pi-w-full pi-p-6 pi-rounded-bl-[20px] pi-rounded-br-[20px] pi-transition-all'>
            <Hangup buttonsVariant='default' />
          </div>

          {/* Tooltips */}
          <CustomThemedTooltip className='pi-z-20' id='tooltip-mute-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-toggle-video-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-record-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-pause-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-screen-share-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-toggle-fullscreen' place='bottom' />
        </div>
      ) : (
        // collapsed view
        <>
          <div className='pi-flex pi-justify-between pi-items-center'>
            <Avatar />
            <Timer startTime={startTime} isNotAlwaysWhite />
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

export default StreamingAnswerView
