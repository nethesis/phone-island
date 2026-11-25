// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { findVideoSourceByNumber } from '../streaming/videoSource'
import { DEFAULT_PREVIEW_ASPECT_RATIO } from '../streaming/previewSize'

/**
 * Aspect ratio of the picture of the video source of the current call: the default one until
 * the first frame (or image) of the source is shown
 */
export const useStreamingAspectRatio = (): number =>
  useSelector((state: RootState) => {
    const source = findVideoSourceByNumber(
      state.streaming.videoSources,
      state.currentCall.streamingSourceNumber,
    )
    return (source && state.streaming.aspectRatios[source.id]) || DEFAULT_PREVIEW_ASPECT_RATIO
  })
