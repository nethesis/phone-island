// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Button } from '../Button'
import { Tooltip } from 'react-tooltip'

export const SwitchDeviceView: FC<SwitchDeviceViewProps> = () => {
  const dispatch = useDispatch<Dispatch>()

  return (
    <>
      <div className='pi-flex pi-flex-col pi-w-full'>
        {/* Header */}
        <div className='pi-flex pi-items-center pi-justify-between'>
          <h1 className='pi-text-lg pi-font-medium pi-text-gray-900 dark:pi-text-gray-50'>
            {t('Settings.Settings')}
          </h1>
          <Button
            onClick={() => dispatch.island.setIslandView('call')}
            variant='transparentSettings'
            data-tooltip-id='tooltip-close-settings'
            data-tooltip-content={t('Common.Close') || ''}
          >
            <FontAwesomeIcon icon={faXmark} size='lg' />
          </Button>
        </div>

        {/* Divider */}
        <div className='pi-border-t pi-border-gray-300 dark:pi-border-gray-600 pi-mt-[-0.5rem]' />

        {/* Devices list */}
        <div className='pi-flex pi-flex-col pi-mt-2'></div>
      </div>
      <Tooltip className='pi-z-20' id='tooltip-close-settings' place='bottom' />
    </>
  )
}

export interface SwitchDeviceViewProps {}
