// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faMicrophone } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { eventDispatch, getJSONItem, setJSONItem, useEventListener } from '../../utils'
import { SettingsHeader } from './SettingsHeader'

const MicrophoneView = () => {
  const { sipcall }: any = useSelector((state: RootState) => state.webrtc)

  const [selectedAudioInput, setSelectedAudioInput] = useState<string | null>(
    getJSONItem('phone-island-audio-input-device').deviceId || null,
  )
  const [actualDevices, setActualDevices]: any = useState([])

  const handleClickAudioInput = (audioInputDevice: string) => {
    setSelectedAudioInput(audioInputDevice)

    if (sipcall.webrtcStuff.myStream) {
      sipcall?.replaceTracks({
        tracks: [
          {
            type: 'audio',
            mid: '0',
            capture: { deviceId: { exact: audioInputDevice } },
          },
        ],
        success: function () {
          console.info('Audio input device switch success!')
          setJSONItem('phone-island-audio-input-device', { deviceId: audioInputDevice })
          eventDispatch('phone-island-call-audio-input-switched', {})
        },
        error: function (err) {
          console.error('Audio input device switch error:', err)
        },
      })
    } else {
      setJSONItem('phone-island-audio-input-device', { deviceId: audioInputDevice })
      eventDispatch('phone-island-call-audio-input-switched', {})
    }
  }

  useEventListener('phone-island-call-audio-input-switch', (data: DeviceInputOutputTypes) => {
    handleClickAudioInput(data.deviceId)
  })

  useEffect(() => {
    const checkInputOutputDevices = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos) => {
          setActualDevices(deviceInfos)
        })
        .catch((error) => {
          console.error('Error fetching devices:', error)
        })
    }

    checkInputOutputDevices()

    navigator.mediaDevices.addEventListener('devicechange', checkInputOutputDevices)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', checkInputOutputDevices)
    }
  }, [selectedAudioInput])

  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null)

  return (
    <div className='pi-flex pi-flex-col pi-w-full'>
      {/* Title */}
      <SettingsHeader title={t('Settings.Microphones')} tooltipPrefix='microphone' />

      {/* Microphone List */}
      <div className='pi-flex pi-flex-col pi-mt-2 pi-space-y-1'>
        {actualDevices
          .filter((device) => device?.kind === 'audioinput')
          .map((audioDevice, index) => (
            <div
              key={index}
              className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 pi-text-base pi-font-normal pi-leading-6 dark:pi-text-gray-200 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md'
              onClick={() => handleClickAudioInput(audioDevice?.deviceId)}
              onMouseEnter={() => setHoveredDevice(audioDevice?.deviceId)}
              onMouseLeave={() => setHoveredDevice(null)}
            >
              <div className='pi-flex pi-items-center'>
                <FontAwesomeIcon icon={faMicrophone} className='pi-mr-2 pi-w-5 pi-h-5' />
                <span>{audioDevice?.label || `Input device ${index + 1}`}</span>
              </div>
              <div className='pi-flex pi-items-center'>
                {selectedAudioInput === audioDevice?.deviceId && (
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

export default MicrophoneView
