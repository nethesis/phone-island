// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import { eventDispatch, getJSONItem, setJSONItem, useEventListener } from '../../utils'
import { SettingsHeader } from './SettingsHeader'
import { useTranslation } from 'react-i18next'

const AudioView = () => {
  const remoteAudioElement: any = useSelector((state: RootState) => state.player.remoteAudio)

  const { t } = useTranslation()

  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string | null>(
    getJSONItem('phone-island-audio-output-device').deviceId || null,
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

  const [actualDevice, setActualDevice]: any = useState([])

  useEffect(() => {
    const checkInputOutputDevices = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos) => {
          setActualDevice(deviceInfos)
        })
        .catch((error) => {
          console.error('error', error)
        })
    }

    checkInputOutputDevices()

    navigator.mediaDevices.addEventListener('devicechange', checkInputOutputDevices)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', checkInputOutputDevices)
    }
  }, [selectedAudioOutput])

  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null)

  return (
    <div className='pi-flex pi-flex-col pi-w-full'>
      {/* Title */}
      <SettingsHeader title={t('Settings.Speakers')} tooltipPrefix='audio' />
      {/* Audio List */}
      <div className='pi-flex pi-flex-col pi-mt-2 pi-space-y-1'>
        {actualDevice
          .filter((device) => device?.kind === 'audioinput')
          .map((audioDevice, index) => (
            <div
              key={index}
              className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 pi-text-base pi-font-normal pi-leading-6 dark:pi-text-gray-200 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md'
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
