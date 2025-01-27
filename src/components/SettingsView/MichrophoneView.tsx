// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, ComponentProps, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faMicrophone } from '@fortawesome/free-solid-svg-icons'
import { MenuItem } from '@headlessui/react'
import { t } from 'i18next'
import { eventDispatch, getJSONItem, setJSONItem, useEventListener } from '../../utils'

const MichrophoneView: FC<MichrophoneViewProps> = ({}) => {
  const { sipcall }: any = useSelector((state: RootState) => state.webrtc)

  const [selectedAudioInput, setSelectedAudioInput] = useState<string | null>(
    getJSONItem('phone-island-audio-input-device').deviceId || null,
  )

  const handleClickAudioInput = (audioInputDevice: string) => {
    setSelectedAudioInput(audioInputDevice)

    if (sipcall.webrtcStuff.myStream) {
      sipcall?.replaceTracks({
        tracks: [
          {
            type: 'audio',
            mid: '0', // We assume mid 0 is audio
            capture: { deviceId: { exact: audioInputDevice } },
          },
        ],
        success: function () {
          console.info('Audio input device switch success!')
          // set device to localstorage
          setJSONItem('phone-island-audio-input-device', { deviceId: audioInputDevice })

          // dispatch event
          eventDispatch('phone-island-call-audio-input-switched', {})
        },
        error: function (err) {
          console.error('Audio input device switch error:', err)
        },
      })
    } else {
      // set device to localstorage
      setJSONItem('phone-island-audio-input-device', { deviceId: audioInputDevice })

      // dispatch event
      eventDispatch('phone-island-call-audio-input-switched', {})
    }
  }
  useEventListener('phone-island-call-audio-input-switch', (data: DeviceInputOutputTypes) => {
    handleClickAudioInput(data.deviceId)
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
  }, [selectedAudioInput])

  return (
    <>
      {/* Microphones */}
      <div className='pi-font-semibold dark:pi-text-gray-50 pi-text-gray-600 pi-py-1 pi-px-4'>
        {t('DropdownContent.Microphones')}
      </div>
      {actualDevice
        .filter((device) => device?.kind === 'audioinput')
        .map((audioDevice, index) => (
          <MenuItem key={index}>
            {({ active }: any) => (
              <div
                className={`pi-flex pi-py-2 pi-px-2 ${
                  active ? 'pi-bg-gray-200 dark:pi-bg-gray-700' : ''
                }`}
                onClick={() => handleClickAudioInput(audioDevice.deviceId)}
                data-stop-propagation={true}
              >
                {/* faCheck on selectedAudioInput */}
                {selectedAudioInput === audioDevice?.deviceId && (
                  <FontAwesomeIcon
                    size='lg'
                    icon={faCheck}
                    className='pi-text-green-600 dark:pi-text-green-400 pi-mr-2'
                  />
                )}

                {/* faCheck if user has no selectedAudioInput and audioDevice is default */}
                {!selectedAudioInput && audioDevice?.deviceId === 'default' && (
                  <FontAwesomeIcon
                    size='lg'
                    icon={faCheck}
                    className='pi-text-green-600 dark:pi-text-green-400 pi-mr-2'
                  />
                )}

                <FontAwesomeIcon
                  size='lg'
                  icon={faMicrophone}
                  className={`${
                    selectedAudioInput !== null &&
                    selectedAudioInput !== '' &&
                    selectedAudioInput !== audioDevice?.deviceId
                      ? 'pi-ml-6'
                      : selectedAudioInput !== '' &&
                        selectedAudioInput !== null &&
                        selectedAudioInput === audioDevice?.deviceId
                      ? ''
                      : selectedAudioInput === null && audioDevice?.deviceId !== 'default'
                      ? 'pi-ml-6'
                      : ''
                  } dark:pi-text-gray-100 pi-text-gray-600 pi-mr-1`}
                />
                <div
                  className={`${
                    active
                      ? 'dark:pi-text-gray-50 pi-text-gray-900'
                      : 'dark:pi-text-gray-50 pi-text-gray-700'
                  }`}
                >
                  {audioDevice?.label || `Input device ${index + 1}`}
                </div>
              </div>
            )}
          </MenuItem>
        ))}
    </>
  )
}

interface MichrophoneViewProps extends ComponentProps<'div'> {
  settingsViewMenuSelected?: string
}

interface DeviceInputOutputTypes {
  deviceId: string
}

export default MichrophoneView
