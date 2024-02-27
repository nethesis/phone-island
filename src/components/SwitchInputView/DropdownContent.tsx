// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, ComponentProps, Fragment, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faEllipsis, faMicrophone, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import { Menu, Transition } from '@headlessui/react'
import { t } from 'i18next'
import { isWebRTC } from '../../lib/user/default_device'
import { eventDispatch, getJSONItem, setJSONItem, useEventListener } from '../../utils'
import { Tooltip } from 'react-tooltip/dist/react-tooltip.min.cjs'

const DropdownContent: FC<DropdownContentProps> = ({ username, status }) => {
  const { sipcall }: any = useSelector((state: RootState) => state.webrtc)
  const remoteAudioElement: any = useSelector((state: RootState) => state.player.remoteAudio)

  const [selectedAudioInput, setSelectedAudioInput] = useState<string | null>(
    getJSONItem('phone-island-audio-input-device').deviceId || null,
  )
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string | null>(
    getJSONItem('phone-island-audio-output-device').deviceId || null,
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
  }, [selectedAudioOutput, selectedAudioInput])
  return (
    <>
      {isWebRTC() ? (
        <Menu as='div' className='relative inline-block text-left' data-stop-propagation={true} data-tooltip-id='tooltip-left'
        data-tooltip-content={t('Tooltip.Settings')}>
          <Menu.Button
            className='pi-bg-transparent enabled:hover:pi-bg-gray-500 focus:pi-ring-gray-500 pi-flex pi-font-sans pi-font-light pi-content-center pi-items-center pi-justify-center pi-tracking-wide pi-duration-200 pi-transform pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-text-white pi-border pi-border-transparent focus:pi-ring-offset-black pi-rounded-full pi-text-sm pi-leading-4 pi-h-12 pi-w-12 pi-col-start-auto pi-transition-color pi-shrink-0'
            data-stop-propagation={true}
          >
            <FontAwesomeIcon
              size='xl'
              icon={faEllipsis}
              className='pi-text-gray-100'
              data-stop-propagation={true}
            />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items
              className='pi-max-h-[13.125rem] pi-z-50 pi-absolute pi-top-0 pi-right-[4.5rem] pi-mt-[-9.5rem] pi-w-56 pi-origin-top-right pi-rounded-md pi-shadow-lg pi-ring-1 pi-bg-black pi-bg-opacity-[0.99] pi-ring-black pi-ring-opacity-5 pi-focus:outline-none pi-cursor-auto pi-border-gray-600 pi-border pi-py-2 pi-overflow-y-auto pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 pi-scrollbar-track-gray-900 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'
              data-stop-propagation={true}
            >
              <div className='' data-stop-propagation={true}>
                {/* Microphones */}
                <div className='pi-font-semibold pi-text-gray-50 pi-py-1 pi-px-4'>
                  {t('DropdownContent.Microphones')}
                </div>
                {actualDevice
                  .filter((device) => device?.kind === 'audioinput')
                  .map((audioDevice, index) => (
                    <Menu.Item key={index}>
                      {({ active }) => (
                        <div
                          className={`pi-flex pi-py-2 pi-px-2  ${active ? 'pi-bg-gray-700' : ''}`}
                          onClick={() => handleClickAudioInput(audioDevice.deviceId)}
                          data-stop-propagation={true}
                        >
                          {/* faCheck on selectedAudioInput */}
                          {selectedAudioInput === audioDevice?.deviceId && (
                            <FontAwesomeIcon
                              size='lg'
                              icon={faCheck}
                              className='pi-text-green-400 pi-mr-2'
                            />
                          )}

                          {/* faCheck if user has no selectedAudioInput and audioDevice is default */}
                          {!selectedAudioInput && audioDevice?.deviceId === 'default' && (
                            <FontAwesomeIcon
                              size='lg'
                              icon={faCheck}
                              className='pi-text-green-400 pi-mr-2'
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
                            } pi-text-gray-100 pi-mr-1`}
                          />
                          <div className='pi-text-gray-50'>
                            {audioDevice?.label || `Input device ${index + 1}`}
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                {/* Divider  */}
                <div className='pi-relative pi-py-2'>
                  <div
                    className='pi-absolute pi-inset-0 pi-flex pi-items-center'
                    aria-hidden='true'
                  >
                    <div className='pi-w-full pi-border-t pi-border-gray-600' />
                  </div>
                </div>
                {/* Speaker */}
                <div
                  className='pi-font-semibold pi-text-gray-50 pi-py-1 pi-px-4'
                  data-stop-propagation={true}
                >
                  {t('DropdownContent.Speakers')}
                </div>
                {actualDevice
                  .filter((device) => device?.kind === 'audiooutput')
                  .map((audioDevice, index) => (
                    <Menu.Item key={index}>
                      {({ active }) => (
                        <div
                          className={`pi-flex pi-py-2 pi-px-2 ${active ? 'pi-bg-gray-700' : ''}`}
                          onClick={() => handleClickAudioOutput(audioDevice?.deviceId)}
                          data-stop-propagation={true}
                        >
                          {/* faCheck on selectedAudioOutput */}
                          {selectedAudioOutput === audioDevice?.deviceId && (
                            <FontAwesomeIcon
                              size='lg'
                              icon={faCheck}
                              className='pi-text-green-400 pi-mr-2'
                            />
                          )}

                          {/* faCheck if user has no selectedAudioInput and audioDevice is default */}
                          {!selectedAudioOutput && audioDevice?.deviceId === 'default' && (
                            <FontAwesomeIcon
                              size='lg'
                              icon={faCheck}
                              className='pi-text-green-400 pi-mr-2'
                            />
                          )}

                          <FontAwesomeIcon
                            size='lg'
                            icon={faVolumeHigh}
                            className={`${
                              selectedAudioOutput !== null &&
                              selectedAudioOutput !== '' &&
                              selectedAudioOutput !== audioDevice?.deviceId
                                ? 'pi-ml-6'
                                : selectedAudioOutput !== '' &&
                                  selectedAudioOutput !== null &&
                                  selectedAudioOutput === audioDevice?.deviceId
                                ? ''
                                : selectedAudioOutput === null &&
                                  audioDevice?.deviceId !== 'default'
                                ? 'pi-ml-6'
                                : ''
                            } pi-text-gray-100 pi-mr-1`}
                          />

                          {/* <FontAwesomeIcon
                          size='lg'
                          icon={faMicrophone}
                          className='pi-text-gray-100 pi-mr-2'
                        /> */}
                          <div className='pi-text-gray-50'>
                            {audioDevice?.label || `Output device ${index + 1}`}
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                {/* Video
              <div className='pi-font-semibold pi-text-gray-700 pi-py-1 pi-px-4'>
                Video
              </div>
              {actualDevice
                .filter((device) => device.kind === 'videoinput')
                .map((videoDevice, index) => (
                  <Menu.Item key={index}>
                    {({ active }) => (
                      <div className='pi-text-gray-700'>
                        Webcam: {videoDevice.label || `Device ${index + 1}`}
                      </div>
                    )}
                  </Menu.Item>
                ))}*/}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      ) : (
        <div></div>
      )}
      <Tooltip className='pi-z-20' id='tooltip-left' place='left' />
    </>
  )
}

interface DropdownContentProps extends ComponentProps<'div'> {
  username?: string
  status?: string
}

interface DeviceInputOutputTypes {
  deviceId: string
}

export default DropdownContent
