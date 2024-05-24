// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useLayoutEffect, type FC } from 'react'
import { StyledName } from '../../styles/Island.styles'
import { motion } from 'framer-motion/dist/framer-motion'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const DisplayName: FC<DisplayNameProps> = () => {
  const [animateText, setAnimateText] = useState<boolean>(false)
  const nameContainer = useRef<null | HTMLDivElement>(null)
  const nameText = useRef<null | HTMLDivElement>(null)
  const NameMotion = motion(StyledName)

  // Get the displayName of the currentCall store
  const { displayName } = useSelector((state: RootState) => state.currentCall)
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)

  const { t } = useTranslation()

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
            className={`pi-w-fit pi-relative pi-inline-block pi-text-gray-900 dark:pi-text-gray-200 ${
              animateText && 'animated-text'
            }`}
            ref={nameText}
          >
            {intrudeListenStatus?.isIntrudeExtension !== '' &&
            intrudeListenStatus?.isIntrudeExtension !== undefined
              ? `${t('Common.Intrude')}` + '-' + intrudeListenStatus?.isIntrudeExtension
              : `${t('Common.Intrude')}`}
          </div>
          <div className='pi-w-6 pi-absolute pi-right-0 pi-top-0 pi-h-full pi-bg-gradient-to-r pi-from-transparent dark:pi-to-gray-950 pi-to-gray-50'></div>
        </NameMotion>
      ) : intrudeListenStatus?.isListen ? (
        <NameMotion
          ref={nameContainer}
          className='pi-whitespace-nowrap pi-relative pi-overflow-hidden'
        >
          <div
            className={`pi-w-fit pi-relative pi-inline-block pi-text-gray-900 dark:pi-text-gray-200 ${
              animateText && 'animated-text'
            }`}
            ref={nameText}
          >
            {intrudeListenStatus?.isListenExtension !== '' &&
            intrudeListenStatus?.isListenExtension !== undefined
              ? `${t('Common.Listen')}` + '-' + intrudeListenStatus?.isListenExtension
              : `${t('Common.Listen')}`}
          </div>
          <div className='pi-w-6 pi-absolute pi-right-0 pi-top-0 pi-h-full pi-bg-gradient-to-r pi-from-transparent dark:pi-to-gray-950 pi-to-gray-50'></div>
        </NameMotion>
      ) : (
        <NameMotion
          ref={nameContainer}
          className='pi-whitespace-nowrap pi-relative pi-overflow-hidden '
        >
          <div
            className={`pi-w-fit pi-relative pi-inline-block pi-text-gray-900 dark:pi-text-gray-200 ${
              animateText && 'animated-text'
            }`}
            ref={nameText}
          >
            {displayName && displayName === '<unknown>'
              ? 'PBX'
              : displayName
              ? displayName
              : t('Call.Outgoing call') || '-'}
          </div>
          <div className='pi-w-6 pi-absolute pi-right-0 pi-top-0 pi-h-full pi-bg-gradient-to-r pi-from-transparent dark:pi-to-gray-950 pi-to-gray-50'>
            {' '}
          </div>
        </NameMotion>
      )}
    </>
  )
}

export default DisplayName

export interface DisplayNameProps {}
