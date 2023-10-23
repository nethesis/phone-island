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
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)

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
    <>
      {intrudeListenStatus?.isIntrude ? (
        <NameMotion
          ref={nameContainer}
          className='pi-whitespace-nowrap pi-relative pi-overflow-hidden'
        >
          <div
            className={`pi-w-fit pi-relative pi-inline-block ${animateText && 'animated-text'}`}
            ref={nameText}
          >
            {intrudeListenStatus?.isIntrudeExtension !== ''
              ? 'Intrude' + '-' + intrudeListenStatus?.isIntrudeExtension
              : '-'}
          </div>
          <div className='pi-w-6 pi-absolute pi-right-0 pi-top-0 pi-h-full pi-bg-gradient-to-r pi-from-transparent pi-to-black'></div>
        </NameMotion>
      ) : intrudeListenStatus?.isListen ? (
        <NameMotion
          ref={nameContainer}
          className='pi-whitespace-nowrap pi-relative pi-overflow-hidden'
        >
          <div
            className={`pi-w-fit pi-relative pi-inline-block ${animateText && 'animated-text'}`}
            ref={nameText}
          >
            {intrudeListenStatus?.isListenExtension !== ''
              ? 'Listen' + '-' + intrudeListenStatus?.isListenExtension
              : '-'}
          </div>
          <div className='pi-w-6 pi-absolute pi-right-0 pi-top-0 pi-h-full pi-bg-gradient-to-r pi-from-transparent pi-to-black'></div>
        </NameMotion>
      ) : (
        <NameMotion
          ref={nameContainer}
          className='pi-whitespace-nowrap pi-relative pi-overflow-hidden'
        >
          <div
            className={`pi-w-fit pi-relative pi-inline-block ${animateText && 'animated-text'}`}
            ref={nameText}
          >
            {displayName && displayName === '<unknown>' ? 'PBX' : displayName && displayName}
          </div>
          <div className='pi-w-6 pi-absolute pi-right-0 pi-top-0 pi-h-full pi-bg-gradient-to-r pi-from-transparent pi-to-black'></div>
        </NameMotion>
      )}
    </>
  )
}

export default DisplayName

export interface DisplayNameProps {}
