// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faVideo } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { eventDispatch, getJSONItem, setJSONItem, useEventListener } from '../../utils'
import { SettingsHeader } from './SettingsHeader'

const VideoInputView = () => {
  const { sipcall }: any = useSelector((state: RootState) => state.webrtc)

  const [selectedVideoInput, setSelectedVideoInput] = useState<string | null>(
    getJSONItem('phone-island-video-input-device').deviceId || null,
  )
  const [actualDevices, setActualDevices]: any = useState([])

  const handleClickVideoInput = (videoInputDevice: string) => {
    setSelectedVideoInput(videoInputDevice)

    if (sipcall.webrtcStuff.myStream) {
      sipcall?.replaceTracks({
        tracks: [
          {
            type: 'video',
            mid: '1',
            capture: { deviceId: { exact: videoInputDevice } },
          },
        ],
        success: function () {
          console.info('Video input device switch success')
          setJSONItem('phone-island-video-input-device', { deviceId: videoInputDevice })
          eventDispatch('phone-island-call-video-input-switched', {})
        },
        error: function (err) {
          console.error('Video input device switch error:', err)
        },
      })
    } else {
      setJSONItem('phone-island-video-input-device', { deviceId: videoInputDevice })
      eventDispatch('phone-island-call-video-input-switched', {})
    }
  }

  useEventListener('phone-island-call-video-input-switch', (data: DeviceInputOutputTypes) => {
    handleClickVideoInput(data.deviceId)
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
  }, [selectedVideoInput])

  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null)

  return (
    <div className='pi-flex pi-flex-col pi-w-full'>
      {/* Title */}
      <SettingsHeader title={t('Settings.Cameras')} tooltipPrefix='video' />

      {/* Video input list */}
      <div className='pi-flex pi-flex-col pi-mt-2 pi-space-y-1 pi-max-h-48 pi-overflow-y-auto pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'>
        {actualDevices
          .filter((device) => device?.kind === 'videoinput')
          .map((videoDevice, index) => (
            <div
              key={index}
              className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 pi-text-base pi-font-normal pi-leading-6 dark:pi-text-gray-200 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md pi-cursor-pointer'
              onClick={() => handleClickVideoInput(videoDevice?.deviceId)}
              onMouseEnter={() => setHoveredDevice(videoDevice?.deviceId)}
              onMouseLeave={() => setHoveredDevice(null)}
            >
              <div className='pi-flex pi-items-center'>
                <FontAwesomeIcon icon={faVideo} className=' pi-mr-2' />
                <span>{videoDevice?.label || `Input device ${index + 1}`}</span>
              </div>
              <div className='pi-flex pi-items-center'>
                {selectedVideoInput === videoDevice?.deviceId && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={`${
                      hoveredDevice === videoDevice?.deviceId
                        ? 'pi-text-gray-500 dark:pi-text-gray-200'
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

export default VideoInputView
