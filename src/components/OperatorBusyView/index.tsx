// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useCallback, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { useTranslation } from 'react-i18next'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faUser } from '@fortawesome/free-solid-svg-icons'
import { hangupCurrentCall } from '../../lib/phone/call'
import { motion } from 'framer-motion'

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

export const OperatorBusyView: FC<OperatorBusyViewProps> = () => {
  const { isOpen, operatorBusy } = useSelector((state: RootState) => state.island)
  const { avatars } = useSelector((state: RootState) => state.avatars)
  const { t } = useTranslation()
  const dispatch = useDispatch<Dispatch>()

  const handleClose = useCallback(() => {
    // Stop any playing busy tone
    dispatch.player.stopAudioPlayer()
    // Reset operator busy state completely when user closes manually
    dispatch.island.resetOperatorBusyCompletely()
    // Reset island view
    dispatch.island.setIslandView(null)
  }, [dispatch])

  // Get avatar URL based on caller number
  const avatarUrl = useMemo(() => {
    if (operatorBusy.callerNumber && avatars?.[operatorBusy.callerNumber]) {
      return avatars[operatorBusy.callerNumber]
    }
    return null
  }, [avatars, operatorBusy.callerNumber])

  // Format display text - show the called number (the number we tried to call)
  const displayText = useMemo(() => {
    if (operatorBusy.calledNumber && operatorBusy.calledNumber !== '') {
      return operatorBusy.calledNumber
    }
    //fallback string
    return '-'
  }, [operatorBusy.calledNumber])

  const statusText = useMemo(() => {
    return t('Call.Number busy') || 'Number busy...'
  }, [t])

  // Stop busy tone when component unmounts
  useEffect(() => {
    return () => {
      dispatch.player.stopAudioPlayer()
    }
  }, [dispatch])

  return (
    <>
      <div className='pi-flex pi-items-center pi-justify-between pi-w-full'>
        {/* Left side - Avatar and info */}
        <div className='pi-flex pi-items-center pi-space-x-3'>
          {/* Avatar */}
          <motion.div className='pi-relative' animate='open' variants={iconVariants}>
            <motion.div
              className='pi-relative pi-z-30 pi-bg-gray-500 dark:pi-bg-gray-600 pi-rounded-full pi-bg-cover pi-flex pi-items-center pi-justify-center'
              style={{
                backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              animate='open'
              variants={iconVariants}
            >
              {!avatarUrl && (
                <FontAwesomeIcon icon={faUser} className='pi-text-white pi-text-2xl' />
              )}
            </motion.div>
          </motion.div>

          {/* Number and status */}
          <div className='pi-flex pi-flex-col'>
            <div className='pi-text-lg pi-font-semibold pi-text-gray-900 dark:pi-text-gray-50 pi-leading-tight'>
              {displayText}
            </div>
            <div className='pi-text-sm pi-text-gray-600 dark:pi-text-gray-400 pi-leading-tight'>
              {statusText}
            </div>
          </div>
        </div>

        {/* Right side - Close button */}
        <Button
          variant='transparent'
          onClick={handleClose}
          className='pi-p-2 pi-rounded-full pi-bg-gray-600 dark:pi-bg-gray-700 hover:pi-bg-gray-700 dark:hover:pi-bg-gray-600'
          data-tooltip-id='tooltip-close-busy-call'
          data-tooltip-content={t('Tooltip.Close') || 'Close'}
        >
          <FontAwesomeIcon icon={faXmark} className='pi-w-5 pi-h-5 pi-text-white' />
        </Button>
      </div>
    </>
  )
}

export interface OperatorBusyViewProps {}
