// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

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

const Avatar: FC = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { avatars } = useSelector((state: RootState) => state.avatars)
  const user = useSelector((state: RootState) => state.users)
  const {
    username,
    number,
    incoming,
    outgoing,
    accepted,
    transferring,
  } = useSelector((state: RootState) => state.currentCall)

  const avatarUrl = useMemo(() => {
    if (transferring) {
      return user?.extensions && user.extensions[number]?.username
        ? avatars?.[user.extensions[number].username]
        : undefined
    }
    return avatars?.[username]
  }, [avatars, username, transferring, user, number])

  const showPulseEffect = incoming || (outgoing && !accepted)

  return (
    <motion.div
      className={`pi-relative ${isOpen ? 'pi--mt-1' : ''}`}
      animate={isOpen ? 'open' : 'closed'}
      variants={iconVariants}
    >
      {showPulseEffect && (
        <motion.div
          style={{ animationDuration: '2s' }}
          animate={isOpen ? 'open' : 'closed'}
          variants={iconVariants}
          className='pi-rounded-xl pi-bg-gray-600 pi-absolute pi-opacity-60 pi-top-0 pi-left-0 pi-animate-ping pi-h-12 pi-w-12'
        />
      )}
      <motion.div
        className='pi-relative pi-z-30 pi-h-12 pi-w-12 pi-bg-secondaryNeutral dark:pi-bg-secondaryNeutralDark pi-rounded-sm pi-bg-cover'
        style={{
          backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
        animate={isOpen ? 'open' : 'closed'}
        variants={iconVariants}
      />
    </motion.div>
  )
}

export default Avatar
