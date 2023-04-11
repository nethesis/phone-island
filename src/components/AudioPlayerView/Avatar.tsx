// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { type TypeTypes } from '../../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullhorn, faVoicemail, faMusic } from '@nethesis/nethesis-solid-svg-icons'
import { motion } from 'framer-motion/dist/framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const Avatar: FC<AvatarProps> = ({ type }) => {
  const { isOpen } = useSelector((state: RootState) => state.island)

  return (
    <motion.div
      animate={
        isOpen
          ? { width: '48px', height: '48px', borderRadius: '12px' }
          : { width: '24px', height: '24px', borderRadius: '6px' }
      }
      className='pi-w-12 pi-h-12 pi-bg-gray-500 pi-rounded-xl pi-flex pi-items-center pi-justify-center'
    >
      {type === 'announcement' ? (
        <FontAwesomeIcon size={isOpen ? '2xl' : 'lg'} icon={faBullhorn} />
      ) : type === 'call_recording' ? (
        <FontAwesomeIcon size={isOpen ? '2xl' : 'lg'} icon={faVoicemail} />
      ) : (
        <FontAwesomeIcon size={isOpen ? '2xl' : 'lg'} icon={faMusic} />
      )}
    </motion.div>
  )
}

export interface AvatarProps {
  type?: TypeTypes | null
}
