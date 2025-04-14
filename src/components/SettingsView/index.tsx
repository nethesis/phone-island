// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleRight,
  faMicrophone,
  faPalette,
  faVideo,
  faVolumeHigh,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import MicrophoneView from './MicrophoneView'
import AudioView from './AudioView'
import ThemeView from './ThemeView'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { useTranslation } from 'react-i18next'
import VideoInputView from './VideoInputView'

export const SettingsView: FC<SettingsViewProps> = () => {
  const { settingsView, previousView } = useSelector((state: RootState) => state.island)
  const { t } = useTranslation()
  const dispatch = useDispatch<Dispatch>()

  const SettingsMenuItem = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 pi-text-base pi-font-normal pi-leading-6 dark:pi-text-gray-200 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md'
    >
      <div className='pi-flex pi-items-center pi-gap-3'>
        <FontAwesomeIcon icon={icon} className='pi-w-5 pi-h-5' />
        <span>{label}</span>
      </div>
      <FontAwesomeIcon icon={faAngleRight} className='pi-w-5 pi-h-5' />
    </button>
  )

  // main settings view
  const MainSettings = (
    <div className='pi-flex pi-flex-col pi-w-full'>
      {/* Header */}
      <div className='pi-flex pi-items-center pi-justify-between pi-text-gray-900 dark:pi-text-gray-50'>
        <h1 className='pi-text-lg pi-font-medium pi-leading-7'>{t('Settings.Settings')}</h1>
        <Button
          onClick={() => dispatch.island.setIslandView(`${previousView || 'call'}`)}
          variant='transparentSettings'
          data-tooltip-id='tooltip-close-settings'
          data-tooltip-content={t('Common.Close') || ''}
        >
          <FontAwesomeIcon icon={faXmark} className='pi-w-5 pi-h-5' />
        </Button>
      </div>

      {/* Divider */}
      <div className='pi-border-t pi-border-gray-300 dark:pi-border-gray-600 pi-mt-1' />

      {/* Menu Items */}
      <div className='pi-flex pi-flex-col pi-mt-2'>
        <SettingsMenuItem
          icon={faMicrophone}
          label={t('Settings.Microphones')}
          onClick={() => dispatch.island.setSettingsView('microphone')}
        />
        <SettingsMenuItem
          icon={faVolumeHigh}
          label={t('Settings.Speakers')}
          onClick={() => dispatch.island.setSettingsView('audioInput')}
        />
        <SettingsMenuItem
          icon={faVideo}
          label={t('Settings.Cameras')}
          onClick={() => dispatch.island.setSettingsView('videoInput')}
        />
        <SettingsMenuItem
          icon={faPalette}
          label={t('Settings.Theme')}
          onClick={() => dispatch.island.setSettingsView('theme')}
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
            return <MicrophoneView />
          case 'audioInput':
            return <AudioView />
          case 'videoInput':
            return <VideoInputView />
          case 'theme':
            return <ThemeView />
          default:
            return MainSettings
        }
      })()}
      <CustomThemedTooltip id='tooltip-close-settings' place='bottom' />
    </>
  )
}

export interface SettingsViewProps {}
