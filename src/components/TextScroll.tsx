/* Copyright (C) 2024 Nethesis S.r.l. */
/* SPDX-License-Identifier: AGPL-3.0-or-later */

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export interface TextScrollProps {
  text: string
}

const TextScroll: React.FC<TextScrollProps> = ({ text }) => {
  const { t } = useTranslation()
  const [scrollText, setScrollText] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLSpanElement | null>(null)
  const translatedText = text === 'unknown' ? t('TextScroll.unknown') : text
  const minCharactersToScroll = 12

  const updateOverflow = useCallback(() => {
    if (!containerRef.current || !measureRef.current) {
      setScrollText(translatedText.length > minCharactersToScroll)
      return
    }

    const hasOverflow = measureRef.current.scrollWidth - containerRef.current.clientWidth > 5
    setScrollText(hasOverflow || translatedText.length > minCharactersToScroll)
  }, [translatedText, minCharactersToScroll])

  useLayoutEffect(() => {
    updateOverflow()
  }, [translatedText, updateOverflow])

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => {
      updateOverflow()
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    if (measureRef.current) {
      observer.observe(measureRef.current)
    }

    return () => observer.disconnect()
  }, [translatedText, updateOverflow])

  const scrollDuration = useMemo(
    () => `${Math.max(8, Math.ceil(translatedText.length / 2))}s`,
    [translatedText],
  )

  return (
    <div ref={containerRef} className='pi-relative pi-block pi-w-full pi-max-w-full pi-overflow-hidden pi-whitespace-nowrap'>
      {scrollText ? (
        <>
          <div
            className='pi-inline-flex pi-whitespace-nowrap'
            style={{ animation: `scrollText ${scrollDuration} linear infinite` }}
          >
            <span className='pi-pr-6'>{translatedText}</span>
            <span className='pi-pr-6' aria-hidden='true'>
              {translatedText}
            </span>
          </div>
          <div className='pi-pointer-events-none pi-absolute pi-right-0 pi-top-0 pi-h-full pi-w-6 pi-bg-gradient-to-r pi-from-transparent pi-to-gray-50 dark:pi-to-gray-950' />
        </>
      ) : (
        <span className='pi-block pi-max-w-full pi-truncate'>{translatedText}</span>
      )}

      <span
        ref={measureRef}
        className='pi-pointer-events-none pi-absolute pi-left-0 pi-top-0 pi-invisible pi-whitespace-nowrap'
        aria-hidden='true'
      >
        {translatedText}
      </span>
    </div>
  )
}

export default TextScroll
