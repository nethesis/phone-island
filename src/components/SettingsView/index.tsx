// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, ComponentProps, Fragment, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronRight,
  faMicrophone,
  faPalette,
  faVolumeHigh,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Button } from '../Button'

export const SettingsView: FC<SettingsViewProps> = () => {
  const { settingsView } = useSelector((state: RootState) => state.island)
  const dispatch = useDispatch<Dispatch>()

  return (
    <div className='pi-flex pi-flex-col pi-w-full'>
      {/* Header */}
      <div className='pi-flex pi-items-center pi-justify-between'>
        <h1 className='pi-text-lg pi-font-medium pi-text-gray-900 dark:pi-text-gray-50'>
          {t('Settings')}
        </h1>
        <Button
          onClick={() => dispatch.island.setIslandView('call')}
          variant='transparent'
          className='pi-mr-[-1rem]'
        >
          <FontAwesomeIcon icon={faXmark} size='lg' />
        </Button>
      </div>

      {/* Divider */}
      <div className='pi-border-t pi-border-gray-300 dark:pi-border-gray-600 pi-mt-[-0.5rem]' />

      {/* Menu Items */}
      <div className='pi-flex pi-flex-col pi-mt-2'>
        <button
          onClick={() => dispatch.island.setSettingsView('microphone')}
          className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 dark:hover:pi-text-gray-50 hover:pi-text-gray-900 dark:pi-text-gray-50 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md'
        >
          <div className='pi-flex pi-items-center pi-gap-3'>
            <FontAwesomeIcon
              icon={faMicrophone}
              className='dark:pi-text-gray-100 pi-text-gray-600'
            />
            <span>{t('DropdownContent.Microphones')}</span>
          </div>
          <FontAwesomeIcon
            icon={faChevronRight}
            className='dark:pi-text-gray-100 pi-text-gray-600'
          />
        </button>

        <button
          onClick={() => dispatch.island.setSettingsView('audioInput')}
          className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 dark:hover:pi-text-gray-50 hover:pi-text-gray-900 dark:pi-text-gray-50 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md'
        >
          <div className='pi-flex pi-items-center pi-gap-3'>
            <FontAwesomeIcon
              icon={faVolumeHigh}
              className='dark:pi-text-gray-100 pi-text-gray-600'
            />
            <span>{t('DropdownContent.Speakers')}</span>
          </div>
          <FontAwesomeIcon
            icon={faChevronRight}
            className='dark:pi-text-gray-100 pi-text-gray-600'
          />
        </button>

        <button
          onClick={() => dispatch.island.setSettingsView('theme')}
          className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 dark:hover:pi-text-gray-50 hover:pi-text-gray-900 dark:pi-text-gray-50 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md'
        >
          <div className='pi-flex pi-items-center pi-gap-3'>
            <FontAwesomeIcon icon={faPalette} className='dark:pi-text-gray-100 pi-text-gray-600' />
            <span>{t('DropdownContent.Theme')}</span>
          </div>
          <FontAwesomeIcon
            icon={faChevronRight}
            className='dark:pi-text-gray-100 pi-text-gray-600'
          />
        </button>
      </div>
    </div>
  )
}

export interface SettingsViewProps {}
