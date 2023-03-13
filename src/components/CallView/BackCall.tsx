// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Timer from './Timer'
import { motion, AnimatePresence } from 'framer-motion/dist/cjs'

const BackCall: FC<BackCallTypes> = ({ isVisible }) => {
  const { displayName } = useSelector((state: RootState) => state.currentCall)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className='absolute w-full bg-gray-500 flex justify-between text-white -mt-10 -z-10 font-sans px-6 pt-3'
          style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px', height: '60px' }}
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          exit={{
            y: 60,
            transitionEnd: {
              display: 'none',
            },
          }}
          transition={{ duration: 0.3 }}
        >
          <div className='font-bold'>{displayName}</div>
          <div className=''>
            <Timer size='small' />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BackCall

interface BackCallTypes {
  isVisible: boolean
}
