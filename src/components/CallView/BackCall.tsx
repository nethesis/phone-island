// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import Timer from './Timer'
import { motion, AnimatePresence } from 'framer-motion/dist/framer-motion'
import { TransferCallsTypes } from '../../models/currentCall'

const BackCall: FC<BackCallTypes> = ({ isVisible }) => {
  const {
    number,
    displayName,
    transferring,
    transferringName,
    startTime,
    transferringStartTime,
    transferCalls,
  } = useSelector((state: RootState) => state.currentCall)
  const dispatch = useDispatch<Dispatch>()

  useEffect(() => {
    const callData: TransferCallsTypes = transferCalls.find((item) => item.number !== number)
    // Handle call switch during transfer
    if (callData) {
      dispatch.currentCall.updateCurrentCall({
        transferringName: callData.displayName,
        transferringStartTime: callData.startTime,
      })
    }
  }, [number])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className='pi-absolute pi-w-full pi-bg-gray-500 pi-flex pi-justify-between pi-text-white -pi-mt-10 -pi-z-10 pi-font-sans pi-px-6 pi-pt-3'
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
          <div className='pi-font-bold pi-text-sm'>
            {transferring ? transferringName : displayName}
          </div>
          <div className=''>
            <Timer size='small' startTime={transferring ? transferringStartTime : startTime} />
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
