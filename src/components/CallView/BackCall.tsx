// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import Timer from './Timer'
import { motion, AnimatePresence } from 'framer-motion'
import { TransferCallsTypes } from '../../models/currentCall'
import AvatarGroup from '../AvatarGroup'

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

  const { isOpen } = useSelector((state: RootState) => state.island)
  const { isActive, usersList, conferenceStartTime }: any = useSelector(
    (state: RootState) => state.conference,
  )

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
          className={`pi-absolute pi-w-full pi-bg-gray-700 pi-flex pi-justify-between pi-text-gray-50 dark:pi-text-gray-50 -pi-mt-10 -pi-z-10 pi-items-top ${
            isOpen ? 'pi-px-6' : 'pi-px-4'
          } pi-pt-3`}
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
          <div className='pi-font-bold pi-text-sm pi-relative'>
            <div
              className={`pi-whitespace-nowrap pi-overflow-hidden ${
                isOpen ? 'pi-w-44' : 'pi-w-16'
              }`}
            >
              {transferring ? transferringName : isActive ? 'Waiting' : displayName}
            </div>
            <div className='pi-w-6 pi-absolute pi-right-0 pi-top-0 pi-h-full pi-bg-gradient-to-r pi-from-transparent pi-to-gray-700'></div>
          </div>
          <div>
            {!isActive ? (
              <Timer size='small' startTime={transferring ? transferringStartTime : startTime} />
            ) : (
              <AvatarGroup usersList={usersList || {}} maxAvatars={5} />
            )}
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
