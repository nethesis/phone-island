// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, ImgHTMLAttributes, memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { getStreamingSourceId } from '../../utils/streaming/getStreamingSourceId'
import VideoStreamingSkeleton from '../VideoStreamingSkeleton'

/**
 * Image of a video source: the whole picture (letterboxed if needed), its aspect ratio is
 * stored to size the box that shows it
 */
export const StreamingSourceImage: FC<
  ImgHTMLAttributes<HTMLImageElement> & { sourceId?: string }
> = ({ sourceId, className = '', onLoad, ...props }) => {
  const dispatch = useDispatch<Dispatch>()
  return (
    <img
      {...props}
      className={`pi-object-contain ${className}`}
      onLoad={(event) => {
        const image = event.currentTarget
        if (sourceId && image.naturalWidth && image.naturalHeight) {
          dispatch.streaming.setSourceAspectRatio({
            source: sourceId,
            aspectRatio: image.naturalWidth / image.naturalHeight,
          })
        }
        onLoad?.(event)
      }}
    />
  )
}

/**
 * Component that displays the streaming image from a source
 */
const StreamingImage: FC<StreamingImageProps> = ({ className = '' }) => {
  const streamingSourceNumber = useSelector(
    (state: RootState) => state.currentCall.streamingSourceNumber,
  )
  const isFromStreaming = useSelector((state: RootState) => state.island.isFromStreaming)
  const sourceImages = useSelector((state: RootState) => state.streaming.sourceImages)
  const videoSources = useSelector((state: RootState) => state.streaming.videoSources)

  const [refreshKey, setRefreshKey] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  const sourceId = streamingSourceNumber ? getStreamingSourceId(streamingSourceNumber) : undefined

  // Find the source to get the image
  const source =
    streamingSourceNumber && videoSources
      ? Object.values(videoSources).find((source) => source.extension === streamingSourceNumber)
      : null

  // get image URL from the source ID or from the source object
  const imageUrl = sourceId ? (sourceImages[sourceId] || source?.image) : null

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (imageUrl) {
      setImageLoaded(false)
    }
  }, [imageUrl])

  if (!isFromStreaming || !streamingSourceNumber) {
    return null
  }

  if (!imageUrl) {
    return <VideoStreamingSkeleton className={className} />
  }

  return (
    <div
      className={`pi-overflow-hidden pi-rounded-lg pi-border pi-border-gray-300 dark:pi-border-gray-700 pi-bg-black ${className}`}
    >
      {!imageLoaded && (
        <VideoStreamingSkeleton className='pi-absolute pi-inset-0 pi-w-full pi-h-full' />
      )}
      <StreamingSourceImage
        key={refreshKey}
        sourceId={source?.id}
        src={imageUrl}
        alt='Streaming view'
        className={`pi-absolute pi-inset-0 pi-w-full pi-h-full pi-transition-opacity pi-duration-300 ${imageLoaded ? 'pi-opacity-100' : 'pi-opacity-0'
          }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
      />
    </div>
  )
}

export interface StreamingImageProps {
  // size and position of the box (e.g. filling a box with the aspect ratio of the picture)
  className?: string
}

export default memo(StreamingImage)
