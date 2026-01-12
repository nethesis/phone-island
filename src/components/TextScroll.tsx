/* Copyright (C) 2024 Nethesis S.r.l. */
/* SPDX-License-Identifier: AGPL-3.0-or-later */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface TextScrollProps {
  text: string
}

const TextScroll: React.FC<TextScrollProps> = ({ text }) => {
  const { t } = useTranslation()
  const [scrollText, setScrollText] = useState(false)
  const translatedText = text === 'unknown' ? t('TextScroll.unknown') : text

  useEffect(() => {
    if (translatedText?.length > 15) {
      setScrollText(true)
    } else {
      setScrollText(false)
    }
  }, [translatedText])

  return (
    <>
      {scrollText ? (
        <div className='pi-text-container pi-mr-4'>
          <div className='pi-text-wrapper pi-flex'>
            <span>{translatedText}</span>
            <span className='pi-ml-4'>{translatedText}</span>
          </div>
        </div>
      ) : (
        <div className='pi-mr-4'>
          <span>{translatedText}</span>
        </div>
      )}
    </>
  )
}

export default TextScroll
