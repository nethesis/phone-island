// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, memo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { getStreamingSourceId } from '../../utils/streaming/getStreamingSourceId'
import VideoStreamingSkeleton from '../VideoStreamingSkeleton'

/**
 * Component that displays the streaming image from a source
 */
const StreamingImage: FC = () => {
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
    return <VideoStreamingSkeleton className='pi-w-[28.2rem] pi-h-[10.5rem] pi-mt-4' />
  }

  return (
    <div className='pi-mt-4 pi-w-[28.2rem] pi-flex pi-justify-center'>
      <div className='pi-relative pi-h-[10.5rem] pi-w-[110rem] pi-overflow-hidden pi-rounded-lg pi-border pi-border-gray-300 dark:pi-border-gray-700'>
        {!imageLoaded && (
          <VideoStreamingSkeleton className='pi-absolute pi-inset-0 pi-w-full pi-h-full' />
        )}
        <img
          key={refreshKey}
          src={imageUrl}
          alt='Streaming view'
          className={`pi-w-full pi-h-full pi-object-cover pi-transition-opacity pi-duration-300 ${imageLoaded ? 'pi-opacity-100' : 'pi-opacity-0'
            }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
        />
      </div>
    </div>
  )
}

export default memo(StreamingImage)
