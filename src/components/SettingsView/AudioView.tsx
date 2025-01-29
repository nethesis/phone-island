// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faXmark,
  faVolumeHigh,
  faAngleLeft,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { eventDispatch, getJSONItem, setJSONItem, useEventListener } from '../../utils'
import { Button } from '../Button'

const AudioView = () => {
  const dispatch = useDispatch()
  const remoteAudioElement: any = useSelector((state: RootState) => state.player.remoteAudio)

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
      <div className='pi-flex pi-items-center pi-justify-between'>
        <div className='pi-flex pi-items-center pi-gap-2'>
          <Button
            onClick={() => dispatch.island.setSettingsView('main')}
            variant='transparentSettings'
          >
            <FontAwesomeIcon icon={faAngleLeft} size='lg' />
          </Button>
          <h1 className='pi-text-lg pi-font-medium pi-text-gray-900 dark:pi-text-gray-50'>
            {t('Settings.Speakers')}
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
        {actualDevice
          .filter((device) => device?.kind === 'audioinput')
          .map((audioDevice, index) => (
            <div
              key={index}
              className='pi-flex pi-items-center pi-justify-between pi-py-3 pi-px-4 pi-rounded-md hover:pi-bg-gray-100 dark:hover:pi-bg-gray-600 pi-text-gray-700 dark:pi-text-gray-200'
              onClick={() => handleClickAudioOutput(audioDevice?.deviceId)}
              onMouseEnter={() => setHoveredDevice(audioDevice?.deviceId)}
              onMouseLeave={() => setHoveredDevice(null)}
            >
              <div className='pi-flex pi-items-center'>
                <FontAwesomeIcon icon={faVolumeHigh} className='pi-mr-2' />
                <span>{audioDevice?.label || `Input device ${index + 1}`}</span>
              </div>
              <div className='pi-flex pi-items-center'>
                {selectedAudioOutput === audioDevice?.deviceId && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={`${
                      hoveredDevice === audioDevice?.deviceId
                        ? 'pi-text-gray-200 dark:pi-text-gray-200'
                        : 'pi-text-green-600 dark:pi-text-green-400'
                    }`}
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
