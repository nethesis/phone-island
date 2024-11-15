/* Copyright (C) 2024 Nethesis S.r.l. */
/* SPDX-License-Identifier: AGPL-3.0-or-later */

import React, { useState, useEffect } from 'react'

interface TextScrollProps {
  text: string
}

const TextScroll: React.FC<TextScrollProps> = ({ text }) => {
  const [scrollText, setScrollText] = useState(false)

  useEffect(() => {
    if (text.length > 15) {
      setScrollText(true)
    } else {
      setScrollText(false)
    }
  }, [text])

  return (
    <>
      {scrollText ? (
        <div className='pi-text-container pi-mr-4'>
          <div className='pi-text-wrapper pi-flex'>
            <span>{text}</span>
            <span className='pi-ml-4'>{text}</span>
          </div>
        </div>
      ) : (
        <div className='pi-mr-4'>
          <span>{text}</span>
        </div>
      )}
    </>
  )
}

export default TextScroll
