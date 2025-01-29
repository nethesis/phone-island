// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faMoon, faSun, faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { eventDispatch } from '../../utils'
import { Button } from '../Button'

const ThemeView = () => {
  const dispatch = useDispatch()
  const handleSelectTheme = (clickedTheme: string) => {
    eventDispatch('phone-island-theme-change', { selectedTheme: clickedTheme })
  }

  const { theme } = useSelector((state: RootState) => state.darkTheme)
  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null)

  return (
    <div className='pi-flex pi-flex-col pi-w-full'>
      {/* Title */}
      <div className='pi-flex pi-items-center pi-justify-between'>
        <div className='pi-flex pi-items-center pi-gap-2'>
          <Button
            onClick={() => dispatch.island.setSettingsView('main')}
            variant='transparentSettings'
          >
            <FontAwesomeIcon icon={faAngleLeft} size='lg' />
          </Button>
          <h1 className='pi-text-lg pi-font-medium pi-text-gray-900 dark:pi-text-gray-50'>
            {t('Settings.Theme')}
          </h1>
        </div>
        <Button onClick={() => dispatch.island.setIslandView('call')} variant='transparentSettings'>
          <FontAwesomeIcon icon={faXmark} size='lg' />
        </Button>
      </div>

      {/* Divider */}
      <div className='pi-border-t pi-border-gray-300 dark:pi-border-gray-600 pi-mt-[-0.5rem]' />
      {/* Microphone List */}
      <div className='pi-flex pi-flex-col pi-mt-2 pi-space-y-1'>
        {[
          { id: 'dark', icon: faMoon, label: 'Settings.Dark' },
          { id: 'light', icon: faSun, label: 'Settings.Light' },
        ].map(({ id, icon, label }) => (
          <div
            key={id}
            className='pi-flex pi-items-center pi-py-3 pi-px-4 dark:hover:pi-text-gray-50 hover:pi-text-gray-900 dark:pi-text-gray-50 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700'
            onClick={() => handleSelectTheme(id)}
            onMouseEnter={() => setHoveredDevice(id)}
            onMouseLeave={() => setHoveredDevice(null)}
            data-stop-propagation={true}
          >
            <FontAwesomeIcon
              size='lg'
              icon={icon}
              className='pi-mr-3 dark:pi-text-gray-100 pi-text-gray-600'
            />
            <div className={`${icon === faMoon ? 'pi-ml-[0.2rem]' : ''} pi-flex-grow`}>
              {t(label)}
            </div>
            {theme === id && (
              <FontAwesomeIcon
                size='lg'
                icon={faCheck}
                className={`${
                  hoveredDevice === id
                    ? 'pi-text-gray-200 dark:pi-text-gray-200'
                    : 'pi-text-green-600 dark:pi-text-green-400'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ThemeView
