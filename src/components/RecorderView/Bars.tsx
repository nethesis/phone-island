// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useRef, RefObject, memo } from 'react'
import useIntersectionObserver from '../../utils/customHooks/useIntersectionObserver'

export const Bar: FC<BarsProps> = memo(({ visibleContainerRef }) => {
  const barRef = useRef<HTMLDivElement>(null)
  const entry = useIntersectionObserver(barRef, { root: visibleContainerRef.current })
  const isVisible = entry?.isIntersecting

  if (isVisible && barRef.current) {
    barRef.current.style.height = `${Math.random() * 96 + 4}%`
  }

  return <div ref={barRef} className='pi-h-1 pi-bg-emerald-500' style={{ width: '0.125rem' }} />
})

export const Bars: FC<{
  visibleContainerRef: RefObject<HTMLDivElement>
}> = ({ visibleContainerRef }) => {
  return (
    <>
      {Array.from(Array(55).keys()).map((_, i) => (
        <Bar key={i} visibleContainerRef={visibleContainerRef} />
      ))}
    </>
  )
}

export interface BarsProps {
  visibleContainerRef: RefObject<HTMLDivElement>
}
