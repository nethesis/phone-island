// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { StyledAvatar } from '../../styles/Island.styles'
import { motion } from 'framer-motion/dist/framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

const AvatarMotion = motion(StyledAvatar)

const iconVariants = {
  open: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
  },
  closed: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
  },
}

const Avatar: FC = () => {
  // Get multiple values from currentCall store
  const { username } = useSelector((state: RootState) => state.currentCall)

  // Get avatars from avatars store
  const { avatars } = useSelector((state: RootState) => state.avatars)

  // Get isOpen from island store
  const { isOpen } = useSelector((state: RootState) => state.island)

  // Get multiple values from currentCall store
  const { incoming, outgoing, accepted } = useSelector((state: RootState) => state.currentCall)

  return (
    <motion.div className='pi-relative' animate={isOpen ? 'open' : 'closed'} variants={iconVariants}>
      {(incoming || (outgoing && !accepted)) && (
        // The background pulse effect
        <motion.div
          style={{
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            borderRadius: '4px',
          }}
          animate={isOpen ? 'open' : 'closed'}
          variants={iconVariants}
          className={`pi-rounded-xl pi-bg-white pi-absolute pi-opacity-60 -pi-z-10 pi-top-0 pi-left-0 pi-animate-ping pi-h-12 pi-w-12`}
        ></motion.div>
      )}
      <AvatarMotion
        className='pi-z-10 pi-h-12 pi-w-12 pi-bg-gray-300 pi-rounded-sm'
        style={{
          backgroundImage: `url(${avatars && avatars[username] && avatars[username]})`,
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
