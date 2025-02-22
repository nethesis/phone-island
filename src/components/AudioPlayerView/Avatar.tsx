// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { type TypeTypes } from '../../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullhorn, faVoicemail, faMusic } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const Avatar: FC<AvatarProps> = ({ type }) => {
  const { isOpen } = useSelector((state: RootState) => state.island)

  return (
    <motion.div
      animate={
        isOpen
          ? { width: '56px', height: '56px', borderRadius: '26px' }
          : { width: '24px', height: '24px', borderRadius: '26px' }
      }
      className='pi-w-12 pi-h-12 pi-bg-gray-500 pi-rounded-xl pi-flex pi-items-center pi-justify-center pi-flex-shrink-0 pi-flex-grow-0'
    >
      {type === 'announcement' ? (
        <FontAwesomeIcon
          size={isOpen ? '2xl' : 'lg'}
          icon={faBullhorn}
          className='pi-text-gray-50 dark:pi-text-gray-50'
        />
      ) : type === 'call_recording' ? (
        <FontAwesomeIcon
          size={isOpen ? '2xl' : 'lg'}
          icon={faVoicemail}
          className='pi-text-gray-50 dark:pi-text-gray-50'
        />
      ) : (
        <FontAwesomeIcon
          size={isOpen ? '2xl' : 'lg'}
          icon={faMusic}
          className='pi-text-gray-50 dark:pi-text-gray-50'
        />
      )}
    </motion.div>
  )
}

export interface AvatarProps {
  type?: TypeTypes | null
}
