// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useRef, useState } from 'react'
import {
  initialStreamingVideoState,
  StreamingVideoSnapshot,
  watchStreamingVideo,
} from '../../lib/streaming/streamingVideo'

const initialSnapshot: StreamingVideoSnapshot = { state: initialStreamingVideoState, stream: null }

const isPageVisible = () => typeof document === 'undefined' || !document.hidden

/**
 * Live video of an "rtsp" video source while enabled and the page is visible.
 * The session is shared with the other views of the same source and released on unmount.
 *
 * onChange is called synchronously on every change, before the re-render (e.g. to grab the last
 * frame before the connection of a stalled session is closed).
 */
export const useStreamingVideo = (
  sourceId: string | undefined,
  whep: string | null | undefined,
  enabled: boolean,
  onChange?: (snapshot: StreamingVideoSnapshot) => void,
): StreamingVideoSnapshot => {
  const [snapshot, setSnapshot] = useState<StreamingVideoSnapshot>(initialSnapshot)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const [pageVisible, setPageVisible] = useState(isPageVisible)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVisibilityChange = () => setPageVisible(isPageVisible())
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    if (!enabled || !pageVisible || !sourceId) return
    const release = watchStreamingVideo(sourceId, whep || null, (next) => {
      onChangeRef.current?.(next)
      setSnapshot(next)
    })
    return () => {
      release()
      setSnapshot(initialSnapshot)
    }
  }, [enabled, pageVisible, sourceId, whep])

  return snapshot
}
