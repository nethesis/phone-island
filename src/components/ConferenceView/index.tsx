// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { useTranslation } from 'react-i18next'

export const SettingsView: FC<SettingsViewProps> = () => {
  const { settingsView, previousView } = useSelector((state: RootState) => state.island)
  const { t } = useTranslation()
  const dispatch = useDispatch<Dispatch>()

  return (
    <>
      <div className='pi-flex pi-flex-col pi-w-full'>
        {/* Header */}
        <div className='pi-flex pi-items-center pi-justify-between pi-text-gray-900 dark:pi-text-gray-50'>
          <h1 className='pi-text-lg pi-font-medium pi-leading-7'>{t('Conference.Conference')}</h1>

          {/* TO-DO ADD TIMER */}
        </div>

        {/* User waiting list */}
        <div className='pi-flex pi-flex-col pi-mt-2 pi-space-y-1 pi-max-h-48 pi-overflow-y-auto pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'></div>
      </div>
    </>
  )
}

export interface SettingsViewProps {}
