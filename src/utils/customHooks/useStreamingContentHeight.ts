// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { Dispatch } from '../../store'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'
import type { StreamingContentHeight } from '../../models/streaming'

/**
 * Measures the content of a streaming view (header, gates, picture, buttons) and stores its
 * height, so the island fits it whatever the host styles (box sizing, fonts, paddings) are.
 * The element measured must not depend on the island height (no h-full): no feedback loop.
 *
 * Returns the ref callback of the element to measure.
 */
export const useStreamingContentHeight = (
  view: StreamingContentHeight['view'],
  enabled: boolean,
) => {
  const dispatch = useDispatch<Dispatch>()
  const [element, setElement] = useState<HTMLElement | null>(null)

  // layout effect: the island gets the right height before the first paint
  useIsomorphicLayoutEffect(() => {
    if (!element || !enabled) return
    const store = (height: number) =>
      dispatch.streaming.setContentHeight({ view, height: Math.ceil(height) })
    store(element.offsetHeight)
    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        // border box size: not affected by the transforms of the island animations
        const size = entries[0]?.borderBoxSize?.[0]?.blockSize
        store(size ?? element.offsetHeight)
      })
      observer.observe(element)
    }
    return () => {
      observer?.disconnect()
      // nothing measured while disabled (e.g. the collapsed island) or once unmounted
      dispatch.streaming.clearContentHeight(view)
    }
  }, [element, enabled, view])

  return setElement
}
