// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { eventDispatch } from '../../utils'
import { SettingsHeader } from './SettingsHeader'

const ThemeView = () => {
  const handleSelectTheme = (clickedTheme: string) => {
    eventDispatch('phone-island-theme-change', { selectedTheme: clickedTheme })
  }

  const { theme } = useSelector((state: RootState) => state.darkTheme)
  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null)

  return (
    <div className='pi-flex pi-flex-col pi-w-full'>
      {/* Title */}
      <SettingsHeader title={t('Settings.Theme')} tooltipPrefix='theme' />
      {/* Theme List */}
      <div className='pi-flex pi-flex-col pi-mt-2 pi-space-y-1'>
        {[
          { id: 'dark', icon: faMoon, label: 'Settings.Dark' },
          { id: 'light', icon: faSun, label: 'Settings.Light' },
        ].map(({ id, icon, label }) => (
          <div
            key={id}
            className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 pi-text-base pi-font-normal pi-leading-6 dark:pi-text-gray-200 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md'
            onClick={() => handleSelectTheme(id)}
            onMouseEnter={() => setHoveredDevice(id)}
            onMouseLeave={() => setHoveredDevice(null)}
            data-stop-propagation={true}
          >
            <FontAwesomeIcon icon={icon} className='pi-mr-2 pi-w-5 pi-h-5' />
            <div className={`${icon === faMoon ? 'pi-ml-[0.2rem]' : ''} pi-flex-grow`}>
              {t(label)}
            </div>
            {theme === id && (
              <FontAwesomeIcon
                size='lg'
                icon={faCheck}
                className={`${
                  hoveredDevice === id
                    ? 'pi-text-gray-700 dark:pi-text-gray-200'
                    : 'pi-text-emerald-700 dark:pi-text-emerald-500'
                } pi-w-5 pi-h-5`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ThemeView
