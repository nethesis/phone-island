// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useCallback, useRef, useState } from 'react'

export const useLongPress = (
  onLongPress: (event: MouseEvent) => void,
  onClick: () => void,
  moved: boolean,
  resetMoved: () => void,
  { shouldPreventDefault = true, delay = 300 } = {},
) => {
  const [longPressTriggered, setLongPressTriggered] = useState<boolean>(false)
  const timeout = useRef()
  const target = useRef()

  const start = useCallback(
    (event) => {
      // Reset moved callback
      resetMoved()

      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, {
          passive: false,
        })
        // Set target element
        target.current = event.target
      }

      // @ts-ignore
      timeout.current = setTimeout(() => {
        onLongPress(event)
        setLongPressTriggered(true)
      }, delay)
    },
    [onLongPress, delay, shouldPreventDefault],
  )

  const clear = useCallback(
    (event, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current)

      shouldTriggerClick &&
        !longPressTriggered &&
        !moved &&
        !isStopPropagation(target.current) &&
        onClick()

      setLongPressTriggered(false)

      if (shouldPreventDefault && target.current) {
        // @ts-ignore
        target.current.removeEventListener('touchend', preventDefault)
      }
    },
    [shouldPreventDefault, onClick, moved, longPressTriggered],
  )

  return {
    onMouseDown: (e) => start(e),
    onTouchStart: (e) => start(e),
    onMouseUp: (e) => clear(e),
    onMouseLeave: (e) => clear(e, false),
    onTouchEnd: (e) => clear(e),
  }
}

function isTouchEvent(event) {
  return 'touches' in event
}

function preventDefault(event) {
  if (!isTouchEvent(event)) return

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault()
  }
}

function isStopPropagation(target) {
  // Check stop propagation attribute
  if (
    (target && target.dataset.stopPropagation) ||
    (target && target.parentNode && target.parentNode.dataset.stopPropagation) ||
    (target && target.parentNode.parentNode && target.parentNode.parentNode.dataset.stopPropagation)
  ) {
    return true
  }
  return false
}
