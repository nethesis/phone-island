// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useLayoutEffect, type FC } from 'react'
import { StyledName } from '../../styles/Island.styles'
import { motion } from 'framer-motion/dist/framer-motion'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'

const DisplayName: FC<DisplayNameProps> = () => {
  const [animateText, setAnimateText] = useState<boolean>(false)
  const nameContainer = useRef<null | HTMLDivElement>(null)
  const nameText = useRef<null | HTMLDivElement>(null)
  const NameMotion = motion(StyledName)

  // Get the displayName of the currentCall store
  const { displayName } = useSelector((state: RootState) => state.currentCall)

  useLayoutEffect(() => {
    if (
      nameContainer.current &&
      nameText.current &&
      nameText.current.clientWidth - nameContainer.current.clientWidth > 5
    ) {
      setAnimateText(true)
    }
  })

  return (
    <NameMotion ref={nameContainer} className='pi-whitespace-nowrap  pi-overflow-hidden'>
      <div
        className={`pi-w-fit pi-relative pi-inline-block ${animateText && 'animate-animated-text'}`}
        ref={nameText}
      >
        {displayName && displayName === '<unknown>' ? 'PBX' : displayName && displayName}
      </div>
    </NameMotion>
  )
}

export default DisplayName

export interface DisplayNameProps {}
