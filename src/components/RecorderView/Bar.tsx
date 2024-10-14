//
// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
//

import React, { type FC, useRef, memo } from 'react'
import useIntersectionObserver from '../../utils/customHooks/useIntersectionObserver'
import { store } from '../../store'

export const Bar: FC<BarProps> = memo(({ visibleContainer }) => {
  const barRef = useRef<HTMLDivElement>(null)
  const intersectionEntry: any = useIntersectionObserver(barRef, { root: visibleContainer || null })

  const { frequency } = store.getState().recorder
  if (barRef.current && intersectionEntry?.isIntersecting) {
    barRef.current.style.height = `${frequency > 0.1 ? frequency * 100 : 10}%`
  }

  return (
    <div
      ref={barRef}
      className='pi-h-1 pi-bg-emerald-700 dark:pi-bg-emerald-500'
      style={{ width: '0.125rem', height: '10%' }}
    />
  )
})

interface BarProps {
  visibleContainer: HTMLDivElement | null
}
