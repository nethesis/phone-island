// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { motion } from 'framer-motion/dist/framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

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
  const { incoming, outgoing, accepted, transferring } = useSelector(
    (state: RootState) => state.currentCall,
  )
  const currentCallDetails: any = useSelector((state: RootState) => state.currentCall)
  const user = useSelector((state: RootState) => state.users)

  return (
    <>
      <motion.div
        className='pi-relative'
        animate={isOpen ? 'open' : 'closed'}
        variants={iconVariants}
      >
        {(incoming || (outgoing && !accepted)) && (
          // The background pulse effect
          <motion.div
            style={{
              animationDuration: '2s',
            }}
            animate={isOpen ? 'open' : 'closed'}
            variants={iconVariants}
            className={`pi-rounded-xl pi-bg-white pi-absolute pi-opacity-60 pi-top-0 pi-left-0 pi-animate-ping pi-h-12 pi-w-12`}
          ></motion.div>
        )}
        {!transferring ? (
          <motion.div
            className='pi-relative pi-z-30 pi-h-12 pi-w-12 pi-bg-gray-300 pi-rounded-sm pi-bg-cover'
            style={{
              backgroundImage: `url(${avatars && avatars[username] && avatars[username]})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
            }}
            animate={isOpen ? 'open' : 'closed'}
            variants={iconVariants}
          />
        ) : (
          <motion.div
            className='pi-relative pi-z-30 pi-h-12 pi-w-12 pi-bg-gray-300 pi-rounded-sm pi-bg-cover'
            style={{
              backgroundImage: `url(${
                avatars &&
                user &&
                user?.extensions &&
                avatars[user?.extensions[currentCallDetails?.number]?.username] &&
                avatars[user?.extensions[currentCallDetails?.number]?.username]
              })`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
            }}
            animate={isOpen ? 'open' : 'closed'}
            variants={iconVariants}
          />
        )}
      </motion.div>
    </>
  )
}

export default Avatar
