// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

const iconVariants = {
  open: {
    width: '56px',
    height: '56px',
    borderRadius: '26px',
  },
  closed: {
    width: '24px',
    height: '24px',
    borderRadius: '26px',
  },
}

export const GenericAvatar: FC<GenericAvatarProps> = ({
  avatarUrl,
  size = 'open',
  showPulseEffect = false,
  pulseColor = 'pi-bg-gray-600',
  backgroundColorClass = 'pi-bg-gray-500 dark:pi-bg-gray-600',
  borderRadius = 'pi-rounded-full',
  fallbackIcon = faUser,
  fallbackIconColor = 'pi-text-white pi-text-2xl',
  className = '',
}) => {
  return (
    <motion.div className={`pi-relative ${className}`} animate={size} variants={iconVariants}>
      {showPulseEffect && (
        <motion.div
          style={{ animationDuration: '2s' }}
          animate={size}
          variants={iconVariants}
          className={`${borderRadius} ${pulseColor} pi-absolute pi-opacity-60 pi-top-0 pi-left-0 pi-animate-ping`}
        />
      )}
      <motion.div
        className={`pi-relative pi-z-30 ${backgroundColorClass} ${borderRadius} pi-bg-cover pi-flex pi-items-center pi-justify-center`}
        style={{
          backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        animate={size}
        variants={iconVariants}
      >
        {!avatarUrl && <FontAwesomeIcon icon={fallbackIcon} className={fallbackIconColor} />}
      </motion.div>
    </motion.div>
  )
}

export interface GenericAvatarProps {
  avatarUrl?: string | null
  size?: 'open' | 'closed'
  showPulseEffect?: boolean
  pulseColor?: string
  backgroundColorClass?: string
  borderRadius?: string
  fallbackIcon?: any
  fallbackIconColor?: string
  className?: string
}
