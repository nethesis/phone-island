// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef, RefObject, useCallback } from 'react'
import { Bars } from './Bars'

function getTranslateXPercent(element: HTMLDivElement) {
  const transformValue = element.style.transform
  const translateXMatch = transformValue.match(/translateX\(([-0-9.]+)%\)/)
  if (translateXMatch && translateXMatch[1]) {
    return parseFloat(translateXMatch[1])
  }
  return 0
}

export const BarsGroup: FC<{
  visibleContainerRef: RefObject<HTMLDivElement>
  index: number
  startAnimation: boolean
}> = ({ visibleContainerRef, index, startAnimation }) => {
  const barsContainerRef = useRef<HTMLDivElement>(null)
  const animationRequestRef = useRef<number>(0)
  const lastTranslateRef = useRef<number>(0)

  const barsGroupAnimation = useCallback(() => {
    if (barsContainerRef.current) {
      // Retrieve the last translate value
      const lastTranslateValue = lastTranslateRef.current
        ? lastTranslateRef.current
        : getTranslateXPercent(barsContainerRef.current)
      // Calculate the new translate value
      const newTranslateValue = lastTranslateValue - 0.5
      const finalTranslateValue = newTranslateValue <= -100 ? 100 : newTranslateValue
      barsContainerRef.current.style.transform = `translateX(${finalTranslateValue}%)`
      // Update the translate ref value
      lastTranslateRef.current = finalTranslateValue
    }
    animationRequestRef.current = requestAnimationFrame(barsGroupAnimation)
  }, [lastTranslateRef])

  useEffect(() => {
    if (startAnimation) {
      animationRequestRef.current = requestAnimationFrame(barsGroupAnimation)
    }
    return () => {
      animationRequestRef.current && cancelAnimationFrame(animationRequestRef.current)
    }
  }, [startAnimation])

  return (
    <div
      id={`${index}`}
      style={{
        transform: `translateX(${100 * index}%)`,
      }}
      className='pi-absolute pi-flex pi-w-fit pi-h-8 pi-gap-1 pi-items-center pi-px-0.5'
      ref={barsContainerRef}
    >
      <Bars visibleContainerRef={visibleContainerRef} />
    </div>
  )
}
