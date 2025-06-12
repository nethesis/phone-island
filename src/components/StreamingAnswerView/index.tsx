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
import { useIsomorphicLayoutEffect } from '../../utils'
import Hangup from '../Hangup'
import {
  muteCurrentCall,
  unmuteCurrentCall,
} from '../../lib/phone/call'
import Avatar from '../CallView/Avatar'
import Timer from '../CallView/Timer'
import { isPhysical } from '../../lib/user/default_device'
import { AudioBars } from '../AudioBars'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { faCamera, faLockOpen } from '@fortawesome/free-solid-svg-icons'
import { capitalizeFirstLetter, getISODateForFilename, handleStreamingUnlock } from '../../utils'

export interface StreamingAnswerViewProps { }

export const StreamingAnswerView: FC<StreamingAnswerViewProps> = () => {
  const dispatch = useDispatch<Dispatch>()
  const {
    muted,
    startTime,
    paused,
    isLocalVideoEnabled,
    showRemoteVideoPlaceHolder,
    streamingSourceNumber,
  } = useSelector((state: RootState) => state.currentCall)
  const { role: screenShareRole, active: screenShareActive } = useSelector(
    (state: RootState) => state.screenShare,
  )
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)
  const { videoSources, sourceImages } = useSelector((state: RootState) => state.streaming)

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

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement)
  }

  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      // exit full screen
      document.exitFullscreen()
    } else {
      // enter full screen
      if (screenShareViewRef.current) {
        ;(screenShareViewRef.current as HTMLElement).requestFullscreen()
      }
    }
  }

  useEffect(() => {
    // register for full screen change
    addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleScreenshot = React.useCallback(() => {
    if (!streamingSourceNumber || !videoSources) return

    const source = Object.values(videoSources).find(
      (source) => source.extension === streamingSourceNumber,
    )
    if (!source || !source.image) return

    const filename = source.description
      ? `${capitalizeFirstLetter(source.description).replace(/\s+/g, '_')}_${getISODateForFilename()}_screenshot.jpg`
      : `screenshot_${getISODateForFilename()}.jpg`

    // Create download link using the base64 image
    const link = document.createElement('a')
    link.href = source.image
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [streamingSourceNumber, videoSources])

  return (
    <>
      {isOpen ? (
        <div
          ref={screenShareViewRef}
          className={isFullscreen ? 'pi-h-screen' : 'pi-h-[480px] pi-w-[600px]'}
        >
          <div className={`pi-flex pi-relative pi-justify-center pi-w-full pi-h-[380px] pi-flex-col`}>
            {/* Video container with rounded corners */}
            <div className='pi-relative pi-flex-1'>
              {/* Streaming source image or placeholder */}
              {streamingSourceImage ? (
                <img
                  src={streamingSourceImage}
                  alt='Streaming source'
                  className='pi-rounded-tl-[20px] pi-rounded-tr-[20px] pi-rounded-bl-[20px] pi-rounded-br-[20px] pi-w-full pi-h-full pi-object-cover'
                />
              ) : (
                <div className='pi-w-full pi-h-full pi-bg-gray-200 dark:pi-bg-gray-800 pi-flex pi-items-center pi-justify-center pi-rounded-tl-[20px] pi-rounded-tr-[20px] pi-rounded-bl-[20px] pi-rounded-br-[20px]'>
                  <FontAwesomeIcon
                    icon={faVideoSlash}
                    className='pi-w-24 pi-h-24 pi-text-gray-400 dark:pi-text-gray-600'
                  />
                </div>
              )}

              {/* Large remote screen */}
              <video
                autoPlay
                muted={true}
                ref={remoteScreen}
                className={`pi-rounded-tl-[20px] pi-rounded-tr-[20px] pi-rounded-bl-[20px] pi-rounded-br-[20px] pi-w-full pi-h-full pi-absolute pi-top-0 pi-left-0 ${!screenShareActive || screenShareRole !== 'listener' ? 'pi-hidden' : ''
                  }`}
              ></video>
              {/* Large local screen */}
              <video
                autoPlay
                muted={true}
                ref={localScreen}
                className={`pi-rounded-tl-[20px] pi-rounded-tr-[20px] pi-rounded-bl-[20px] pi-rounded-br-[20px] pi-w-full pi-h-full pi-absolute pi-top-0 pi-left-0 ${!screenShareActive || screenShareRole !== 'publisher' ? 'pi-hidden' : ''
                  }`}
              ></video>
              {/* Large remote video */}
              <video
                autoPlay
                muted={true}
                ref={largeRemoteVideo}
                className={`pi-rounded-tl-[20px] pi-rounded-tr-[20px] pi-rounded-bl-[20px] pi-rounded-br-[20px] pi-absolute pi-top-0 pi-left-0 ${screenShareActive || showRemoteVideoPlaceHolder ? 'pi-hidden' : ''
                  }`}
              ></video>
              {/* Small local video */}
              <video
                muted={true}
                autoPlay
                ref={localVideo}
                className={`pi-max-w-32 pi-max-h-32 pi-absolute pi-top-5 pi-right-5 pi-rounded-lg ${!isLocalVideoEnabled ? 'pi-hidden' : ''
                  }`}
              ></video>
              {/* Small remote video */}
              <video
                muted={true}
                autoPlay
                ref={smallRemoteVideo}
                className={`pi-max-w-32 pi-max-h-32 pi-absolute pi-top-32 pi-right-5 pi-rounded-lg ${!screenShareActive || showRemoteVideoPlaceHolder ? 'pi-hidden' : ''
                  }`}
              ></video>

              {/* Controls overlay (above the image with transparency) */}
              <div className='pi-absolute pi-bottom-0 pi-left-0 pi-right-0 pi-bg-black/30 pi-p-4'>
                <div>
                  <div className='pi-flex pi-items-center pi-justify-center pi-gap-4'>
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

                    {/* Screenshot button */}
                    <Button
                      variant='default'
                      onClick={handleScreenshot}
                      data-tooltip-id='tooltip-screenshot-streaming'
                      data-tooltip-content={t('VideoStreaming.Take a screenshot') || 'Take a screenshot'}
                    >
                      <FontAwesomeIcon
                        className='pi-h-5 pi-w-5'
                        icon={faCamera}
                      />
                    </Button>

                    {/* Open door button */}
                    <Button
                      variant='default'
                      onClick={handleStreamingUnlock}
                      data-tooltip-id='tooltip-unlock-streaming'
                      data-tooltip-content={t('VideoStreaming.Open door') || 'Open door'}
                    >
                      <FontAwesomeIcon
                        className='pi-h-5 pi-w-5'
                        icon={faLockOpen}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer below the image */}
            <div className='pi-bg-gray-950 pi-pt-4 pi-rounded-bl-[20px] pi-rounded-br-[20px]'>
              <Hangup 
                buttonsVariant='default' 
                showFullscreenButton={true}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullScreen}
              />
            </div>

          </div>

          {/* Tooltips */}
          <CustomThemedTooltip className='pi-z-20' id='tooltip-mute-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-screenshot-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-unlock-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-record-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-pause-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-screen-share-streaming' place='bottom' />
          <CustomThemedTooltip className='pi-z-20' id='tooltip-toggle-fullscreen' place='bottom' />
        </div>
      ) : (
        // Collapsed view
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
