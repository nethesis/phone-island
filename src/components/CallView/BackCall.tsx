// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import Timer from './Timer'
import { motion, AnimatePresence } from 'framer-motion'
import { TransferCallsTypes } from '../../models/currentCall'
import { faDisplay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import AvatarGroup from '../AvatarGroup'
import { isEmpty } from '../../utils/genericFunctions/isEmpty'

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

  const { t } = useTranslation()
  const { isOpen, previousView } = useSelector((state: RootState) => state.island)
  const { active: screenShareActive, role: screenShareRole } = useSelector(
    (state: RootState) => state.screenShare,
  )
  const { isActive, usersList, ownerInformations }: any = useSelector(
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
          className={`pi-absolute pi-w-full pi-bg-gray-700 pi-flex pi-justify-between pi-text-gray-50 dark:pi-text-gray-50 -pi-mt-10 -pi-z-10 pi-items-start ${
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
          <div className='pi-font-medium pi-text-sm pi-relative'>
            <div
              className={`pi-whitespace-nowrap pi-overflow-hidden ${
                isOpen && previousView !== 'video' ? 'pi-w-44' : 'pi-w-16'
              }`}
            >
              {transferring
                ? transferringName
                : isActive && !isEmpty(ownerInformations)
                ? t('Conference.In conference')
                : isActive && isEmpty(ownerInformations)
                ? t('Conference.Waiting for the conference')
                : displayName}
            </div>
            <div className='pi-w-6 pi-absolute pi-right-0 pi-top-0 pi-h-full pi-bg-gradient-to-r pi-from-transparent pi-to-gray-700'></div>
          </div>
          <div className='pi-flex pi-gap-2'>
            {/* Screen sharing badge */}
            {screenShareActive && screenShareRole === 'publisher' && (
              <div className='pi-flex pi-gap-2 pi-font-medium pi-items-center pi-rounded-full pi-px-2 pi-py-1 pi-text-xs pi-relative -pi-top-0.5 pi-bg-emerald-700 pi-text-emerald-50'>
                <FontAwesomeIcon icon={faDisplay} className='pi-w-4 pi-h-4' />
                {t('Screen sharing.Sharing')}
              </div>
            )}
            <div className='pi-w-16 pi-flex pi-justify-end'>
              {!isActive ? (
                <Timer size='small' startTime={transferring ? transferringStartTime : startTime} />
              ) : (
                <AvatarGroup usersList={usersList || {}} maxAvatars={5} />
              )}
            </div>
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
