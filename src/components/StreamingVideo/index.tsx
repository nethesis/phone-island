// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, memo, RefObject, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import type { Dispatch } from '../../store'
import type { VideoSourceType } from '../../models/streaming'
import { useStreamingVideo } from '../../utils/customHooks/useStreamingVideo'
import VideoStreamingSkeleton from '../VideoStreamingSkeleton'
import VideoStreamingEmptyState from '../VideoStreamingEmptyState'

/**
 * Live video of an "rtsp" video source (door intercom).
 *
 * The video is always muted: the audio of the intercom is the SIP call itself.
 * The whole picture is shown (letterboxed if needed): its aspect ratio is stored to size the box.
 */
const StreamingVideo: FC<StreamingVideoProps> = ({
  source,
  active = true,
  className = '',
  videoClassName = '',
  overlayClassName = 'pi-rounded-lg',
  reconnectingClassName = 'pi-bottom-3',
  videoRef,
}) => {
  const { t } = useTranslation()
  const dispatch = useDispatch<Dispatch>()
  const ownVideoRef = useRef<HTMLVideoElement>(null)
  const ref = videoRef || ownVideoRef
  // last frame shown while reconnecting: the <video> turns black when the stalled connection
  // is closed, so the frame is grabbed when the stall is detected, before the close. It is kept
  // while the new connection waits for its first picture.
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null)
  const frozenFrameRef = useRef<string | null>(null)
  const { state, stream } = useStreamingVideo(source.id, source.whep, active, (next) => {
    if (next.state.status === 'reconnecting') {
      if (!frozenFrameRef.current) {
        // synchronous: the stalled connection is still open here
        frozenFrameRef.current = captureVideoFrame(ref.current)
        setFrozenFrame(frozenFrameRef.current)
      }
    } else if (next.state.status === 'waiting') {
      // waiting on the same connection: its <video> keeps the last frame by itself
    } else if (frozenFrameRef.current) {
      frozenFrameRef.current = null
      setFrozenFrame(null)
    }
  })

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (video.srcObject !== stream) {
      video.srcObject = stream
    }
    if (stream) {
      video.play().catch(() => {})
    }
  }, [stream, ref])

  // the size of the video is known with the first frame and changes if the source changes it
  const storeAspectRatio = () => {
    const video = ref.current
    if (video && video.videoWidth && video.videoHeight) {
      dispatch.streaming.setSourceAspectRatio({
        source: source.id,
        aspectRatio: video.videoWidth / video.videoHeight,
      })
    }
  }

  // the last frame stays visible while waiting for the next picture or reconnecting
  const showVideo =
    state.status === 'playing' ||
    state.status === 'reconnecting' ||
    (state.status === 'waiting' && state.hasPicture)

  let unavailableMessage: string | undefined
  if (state.failure === 'codec') {
    unavailableMessage = t(
      'VideoStreaming.Your browser cannot play the video format of this source',
    )
  } else if (state.failure === 'forbidden') {
    unavailableMessage = t("VideoStreaming.You don't have permission to watch this video source")
  } else if (state.failure === 'busy') {
    unavailableMessage = t('VideoStreaming.Too many open videos: close one to watch this')
  }

  return (
    <div
      className={`pi-relative pi-overflow-hidden ${className}`}
      data-streaming-video={state.status}
    >
      <video
        ref={ref}
        aria-label={source.description || t('VideoStreaming.Video source')}
        muted
        autoPlay
        playsInline
        disablePictureInPicture
        onLoadedMetadata={storeAspectRatio}
        onResize={storeAspectRatio}
        className={`pi-w-full pi-h-full pi-object-contain pi-bg-black pi-transition-opacity pi-duration-300 ${
          showVideo ? 'pi-opacity-100' : 'pi-opacity-0'
        } ${videoClassName}`}
      />
      {(state.status === 'connecting' || (state.status === 'waiting' && !state.hasPicture)) && (
        <VideoStreamingSkeleton
          className={`pi-absolute pi-inset-0 pi-w-full pi-h-full ${overlayClassName}`}
          message={
            state.status === 'waiting' ? t('VideoStreaming.Waiting for the picture') : undefined
          }
        />
      )}
      {state.status === 'unavailable' && (
        <VideoStreamingEmptyState
          className={`pi-absolute pi-inset-0 pi-w-full pi-h-full ${overlayClassName}`}
          message={unavailableMessage}
        />
      )}
      {(state.status === 'reconnecting' || state.status === 'waiting') && frozenFrame && (
        <img
          src={frozenFrame}
          alt=''
          className={`pi-absolute pi-inset-0 pi-w-full pi-h-full pi-object-contain ${videoClassName}`}
        />
      )}
      {(state.status === 'reconnecting' || (state.status === 'waiting' && state.hasPicture)) && (
        // bottom centre: devices often print the time in the top corners
        <div
          role='status'
          className={`pi-absolute ${reconnectingClassName} pi-left-1/2 -pi-translate-x-1/2 pi-flex pi-items-center pi-whitespace-nowrap pi-gap-1.5 pi-rounded-full pi-bg-black/60 pi-px-2.5 pi-py-1 pi-text-xs pi-font-medium pi-text-white`}
        >
          <FontAwesomeIcon icon={faCircleNotch} className='pi-h-3 pi-w-3 pi-animate-spin' />
          {state.status === 'waiting'
            ? t('VideoStreaming.Waiting for the picture')
            : t('VideoStreaming.Reconnecting')}
        </div>
      )}
    </div>
  )
}

/**
 * Current frame of a video as a JPEG data URI, null when there is no frame
 */
export const captureVideoFrame = (video: HTMLVideoElement | null): string | null => {
  if (!video || !video.videoWidth || !video.videoHeight) return null
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext('2d')
  if (!context) return null
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.92)
}

export interface StreamingVideoProps {
  source: VideoSourceType
  // the session runs only while active (e.g. the island is expanded)
  active?: boolean
  className?: string
  videoClassName?: string
  // classes of the skeleton and empty state overlays (rounded corners)
  overlayClassName?: string
  // position of the "reconnecting" / "waiting" badge (bottom centre), e.g. above an overlay bar
  reconnectingClassName?: string
  videoRef?: RefObject<HTMLVideoElement>
}

export default memo(StreamingVideo)
