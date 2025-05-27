// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useMemo } from 'react'
import { type TypeTypes } from '../../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullhorn, faVoicemail, faMusic, type IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

const animationVariants = {
  open: { width: '56px', height: '56px', borderRadius: '26px' },
  closed: { width: '24px', height: '24px', borderRadius: '26px' }
}

export const Avatar: FC<AvatarProps> = ({ type }) => {
  const { isOpen } = useSelector((state: RootState) => state.island)

  const icon: IconDefinition = useMemo(() => {
    switch(type) {
      case 'announcement': return faBullhorn
      case 'call_recording': return faVoicemail
      default: return faMusic
    }
  }, [type])

  return (
    <motion.div
      animate={isOpen ? 'open' : 'closed'}
      variants={animationVariants}
      className='pi-w-12 pi-h-12 pi-bg-secondaryNeutral dark:pi-bg-secondaryNeutralDark pi-rounded-xl pi-flex pi-items-center pi-justify-center pi-flex-shrink-0 pi-flex-grow-0'
    >
      <FontAwesomeIcon
        size={isOpen ? '2xl' : 'lg'}
        icon={icon}
        className='pi-text-gray-50 dark:pi-text-gray-50'
      />
    </motion.div>
  )
}

export interface AvatarProps {
  type?: TypeTypes | null
}
