// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, memo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { getStreamingSourceId } from '../../utils/streaming/getStreamingSourceId'

/**
 * Component that displays the streaming image from a source
 */
const StreamingImage: FC = () => {
  const streamingSourceNumber = useSelector(
    (state: RootState) => state.currentCall.streamingSourceNumber,
  )
  const isFromStreaming = useSelector((state: RootState) => state.island.isFromStreaming)
  const sourceImages = useSelector((state: RootState) => state.streaming.sourceImages)

  const [refreshKey, setRefreshKey] = useState(0)

  const sourceId = streamingSourceNumber ? getStreamingSourceId(streamingSourceNumber) : undefined

  // get 64base image URL from the source ID
  const imageUrl = sourceId ? sourceImages[sourceId] : null

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (!isFromStreaming || !streamingSourceNumber || !imageUrl) {
    return null
  }

  return (
    <div className='pi-mt-4 pi-w-[28.2rem] pi-flex pi-justify-center'>
      <div className='pi-relative pi-h-[10.5rem] pi-w-[110rem] pi-overflow-hidden pi-rounded-lg pi-border pi-border-gray-300 dark:pi-border-gray-700'>
        <img
          key={refreshKey}
          src={imageUrl}
          alt='Streaming view'
          className='pi-w-full pi-h-full pi-object-cover'
        />
      </div>
    </div>
  )
}

export default memo(StreamingImage)
