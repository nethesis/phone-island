// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import { eventDispatch, setJSONItem, useEventListener } from '../../utils'
import { SettingsHeader } from './SettingsHeader'
import { useTranslation } from 'react-i18next'
import { getCurrentAudioOutputDeviceId } from '../../lib/devices/devices'

const AudioView = () => {
  const remoteAudioElement: any = useSelector((state: RootState) => state.player.remoteAudio)

  const { t } = useTranslation()
  const audioOutputDevices = store.select.mediaDevices.audioOutputDevices(store.getState())
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string | null>(
    getCurrentAudioOutputDeviceId() || null,
  )
  const handleClickAudioOutput = (audioOutputDevice: string) => {
    setSelectedAudioOutput(audioOutputDevice)

    remoteAudioElement?.current
      .setSinkId(audioOutputDevice)
      .then(function () {
        console.info('Audio output device switch success!')
        // set device to localstorage
        setJSONItem('phone-island-audio-output-device', { deviceId: audioOutputDevice })

        // dispatch event
        eventDispatch('phone-island-call-audio-output-switched', {})
      })
      .catch(function (err) {
        console.error('Audio output device switch error:', err)
      })
  }
  useEventListener('phone-island-call-audio-output-switch', (data: DeviceInputOutputTypes) => {
    handleClickAudioOutput(data.deviceId)
  })

  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null)

  return (
    <div className='pi-flex pi-flex-col pi-w-full'>
      {/* Title */}
      <SettingsHeader title={t('Settings.Speakers')} tooltipPrefix='audio' />
      {/* Audio List */}
      <div className='pi-flex pi-flex-col pi-mt-2 pi-space-y-1 pi-max-h-48 pi-overflow-y-auto pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'>
        {audioOutputDevices.map((audioDevice, index) => (
          <div
            key={index}
            className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 pi-text-base pi-font-normal pi-leading-6 dark:pi-text-gray-200 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md pi-cursor-pointer'
            onClick={() => handleClickAudioOutput(audioDevice?.deviceId)}
            onMouseEnter={() => setHoveredDevice(audioDevice?.deviceId)}
            onMouseLeave={() => setHoveredDevice(null)}
          >
            <div className='pi-flex pi-items-center'>
              <FontAwesomeIcon icon={faVolumeHigh} className='pi-mr-2 pi-w-5 pi-h-5' />
              <span>{audioDevice?.label || `Input device ${index + 1}`}</span>
            </div>
            <div className='pi-flex pi-items-center'>
              {selectedAudioOutput === audioDevice?.deviceId && (
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`${
                    hoveredDevice === audioDevice?.deviceId
                      ? 'pi-text-gray-700 dark:pi-text-gray-200'
                      : 'pi-text-emerald-700 dark:pi-text-emerald-500'
                  } pi-w-5 pi-h-5`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DeviceInputOutputTypes {
  deviceId: string
}

export default AudioView
