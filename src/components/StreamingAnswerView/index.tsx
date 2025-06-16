// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMicrophone,
  faMicrophoneSlash,
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
    streamingSourceNumber,
  } = useSelector((state: RootState) => state.currentCall)
  const { isOpen, isExtraLarge } = useSelector((state: RootState) => state.island)
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)
  const { videoSources, sourceImages } = useSelector((state: RootState) => state.streaming)

  // Get streaming source image and check if unlock is available
  const streamingSourceData = React.useMemo(() => {
    if (!streamingSourceNumber || !videoSources) return { image: null, canUnlock: false, tooltipText: '' }

    const source = Object.values(videoSources).find(
      (source) => source.extension === streamingSourceNumber,
    )
    if (!source) return { image: null, canUnlock: false, tooltipText: '' }

    const image = sourceImages[source.id] || source.image || null
    const canUnlock = Boolean(source.cmdOpen && source.cmdOpen.trim() !== '')
    const tooltipText = canUnlock ? `${t('VideoStreaming.Open')}: ${source.description}` : ''

    return { image, canUnlock, tooltipText }
  }, [streamingSourceNumber, videoSources, sourceImages, t])

  const [isFullscreen, setIsFullscreen] = useState(false)
  const streamingAnswerViewRef = useRef(null)
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
      if (streamingAnswerViewRef.current) {
        ; (streamingAnswerViewRef.current as HTMLElement).requestFullscreen()
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
          ref={streamingAnswerViewRef}
          className={isFullscreen ? 'pi-h-screen pi-w-full' : isExtraLarge ? 'pi-h-[624px] pi-w-[780px]' : 'pi-h-[480px] pi-w-[600px]'}
        >
          <div className={`${isFullscreen ? `pi-h-[500px]` : isExtraLarge ? `pi-h-[524px]` : `pi-h-[380px]`} pi-flex pi-relative pi-justify-center pi-w-full pi-flex-col`}>
            {/* Video container with rounded corners */}
            <div className='pi-relative pi-flex-1'>
              {/* Streaming source image or placeholder */}
              {streamingSourceData.image ? (
                <img
                  src={streamingSourceData.image}
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

              {/* Controls overlay (above the image with transparency) */}
              <div className='pi-absolute pi-bottom-0 pi-left-0 pi-right-0 pi-bg-black/30 pi-p-4 pi-rounded-b-3xl'>
                <div>
                  <div className='pi-flex pi-items-center pi-justify-center pi-gap-6'>
                    {/* Mute button */}
                    <Button
                      variant='default'
                      onClick={muted ? unmuteCurrentCall : muteCurrentCall}
                      data-tooltip-id='tooltip-mute-streaming'
                      data-tooltip-content={muted ? t('Tooltip.Unmute') : t('Tooltip.Mute')}
                    >
                      <FontAwesomeIcon
                        className='pi-h-6 pi-w-6'
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
                        className='pi-h-6 pi-w-6'
                        icon={faCamera}
                      />
                    </Button>

                    {/* Open door button - only show if cmdOpen is valid */}
                    {streamingSourceData?.canUnlock && (
                      <Button
                        variant='default'
                        onClick={handleStreamingUnlock}
                        data-tooltip-id='tooltip-unlock-streaming'
                        data-tooltip-content={streamingSourceData?.tooltipText}
                      >
                        <FontAwesomeIcon
                          className='pi-h-6 pi-w-6'
                          icon={faLockOpen}
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer below the image */}
            <div className='pi-bg-surfaceBackground dark:pi-bg-surfaceBackgroundDark pi-pt-4 pi-rounded-bl-[20px] pi-rounded-br-[20px]'>
              <Hangup
                buttonsVariant='default'
                showFullscreenButton={true}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullScreen}
                isExtraLarge={isExtraLarge}
                onToggleExtraLarge={() => dispatch.island.setExtraLarge(!isExtraLarge)}
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
