// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
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
import MichrophoneView from './MichrophoneView'
import AudioView from './AudioView'
import ThemeView from './ThemeView'
import { Tooltip } from 'react-tooltip'

export const SettingsView: FC<SettingsViewProps> = () => {
  const { settingsView } = useSelector((state: RootState) => state.island)
  const dispatch = useDispatch<Dispatch>()

  const SettingsMenuItem = ({ icon, label, onClick, marginLeft }) => (
    <button
      onClick={onClick}
      className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 dark:hover:pi-text-gray-50 hover:pi-text-gray-900 dark:pi-text-gray-50 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md'
    >
      <div className='pi-flex pi-items-center pi-gap-3'>
        <FontAwesomeIcon icon={icon} className='dark:pi-text-gray-100 pi-text-gray-600' />
        <span
          className={`${
            marginLeft === 'audio'
              ? ''
              : marginLeft === 'microphone'
              ? 'pi-ml-[0.4rem]'
              : 'pi-ml-[0.2rem]'
          }`}
        >
          {label}
        </span>
      </div>
      <FontAwesomeIcon icon={faChevronRight} className='dark:pi-text-gray-100 pi-text-gray-600' />
    </button>
  )

  // main settings view
  const MainSettings = (
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

      {/* Menu Items */}
      <div className='pi-flex pi-flex-col pi-mt-2'>
        <SettingsMenuItem
          icon={faMicrophone}
          label={t('Settings.Microphones')}
          onClick={() => dispatch.island.setSettingsView('microphone')}
          marginLeft='microphone'
        />
        <SettingsMenuItem
          icon={faVolumeHigh}
          label={t('Settings.Speakers')}
          onClick={() => dispatch.island.setSettingsView('audioInput')}
          marginLeft='audio'
        />
        <SettingsMenuItem
          icon={faPalette}
          label={t('Settings.Theme')}
          onClick={() => dispatch.island.setSettingsView('theme')}
          marginLeft='theme'
        />
      </div>
    </div>
  )

  return (
    <>
      {(() => {
        switch (settingsView) {
          case 'main':
            return MainSettings
          case 'microphone':
            return <MichrophoneView />
          case 'audioInput':
            return <AudioView />
          case 'theme':
            return <ThemeView />
          default:
            return MainSettings
        }
      })()}
      <Tooltip className='pi-z-20' id='tooltip-close-settings' place='bottom' />
    </>
  )
}

export interface SettingsViewProps {}
