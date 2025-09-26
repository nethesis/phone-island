// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useCallback, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { useTranslation } from 'react-i18next'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { GenericAvatar } from '../GenericAvatar'
import { CustomThemedTooltip } from '../CustomThemedTooltip'

export const OperatorBusyView: FC<OperatorBusyViewProps> = () => {
  const { operatorBusy } = useSelector((state: RootState) => state.island)
  const { avatars } = useSelector((state: RootState) => state.avatars)
  const { extensions } = useSelector((state: RootState) => state.users)
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

  // Get the username of the operator based on called extension number
  const operatorUsername = useMemo(() => {
    // Check if we have the called number and extensions are loaded
    if (operatorBusy?.calledNumber && extensions) {
      // Find the extension that matches the called number
      const extension = Object.values(extensions).find(
        (ext) => ext.exten === operatorBusy?.calledNumber,
      )
      // Return the username if found
      return extension ? extension?.username : null
    }
    return null
  }, [extensions, operatorBusy?.calledNumber])

  // Get avatar URL based on operator's username
  const avatarUrl = useMemo(() => {
    // If we have the username and avatars, look for the avatar
    if (operatorUsername && avatars && avatars[operatorUsername]) {
      return avatars[operatorUsername]
    }
    return null
  }, [avatars, operatorUsername])

  // Check if the called number is an operator (has username)
  const isOperator = useMemo(() => {
    return operatorUsername !== null
  }, [operatorUsername])

  // Format display text - show the operator name or called number
  const displayText = useMemo(() => {
    if (extensions && operatorBusy?.calledNumber && operatorBusy?.calledNumber !== '') {
      // Try to get the extension to display the name if available
      const extension = Object.values(extensions).find(
        (ext) => ext?.exten === operatorBusy?.calledNumber,
      )

      // If we found the extension and it has a name, show the name
      if (extension && extension?.name && extension?.name !== '') {
        return extension?.name
      }

      // Otherwise just show the extension number
      return operatorBusy?.calledNumber
    }
    //fallback string
    return '-'
  }, [operatorBusy?.calledNumber, extensions])

  const statusText = useMemo(() => {
    // If it's an operator, show "User busy", otherwise show "Number busy"
    if (isOperator) {
      return t('Call.User busy') || 'User busy...'
    }
    return t('Call.Number busy') || 'Number busy...'
  }, [t, isOperator])

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
          <GenericAvatar avatarUrl={avatarUrl} size='open' showPulseEffect={false} />

          {/* Number and status */}
          <div className='pi-flex pi-flex-col'>
            <div className='pi-text-lg pi-font-medium pi-text-primaryNeutral dark:pi-text-primaryNeutralDark'>
              {displayText}
            </div>
            <div className='pi-text-sm pi-font-regular pi-text-primaryNeutral dark:pi-text-primaryNeutralDark'>
              {statusText}
            </div>
          </div>
        </div>

        {/* Right side - Close button */}
        <Button
          variant='default'
          onClick={handleClose}
          className='pi-p-2'
          data-tooltip-id='tooltip-close-busy-call'
          data-tooltip-content={t('Tooltip.Close') || 'Close'}
        >
          <FontAwesomeIcon icon={faXmark} className='pi-w-5 pi-h-5' />
        </Button>
      </div>
      <CustomThemedTooltip className='pi-z-20' id='tooltip-close-busy-call' place='left' />
    </>
  )
}

export interface OperatorBusyViewProps {}
