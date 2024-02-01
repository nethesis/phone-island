// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, ComponentProps, Fragment, useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faEllipsis,
  faMicrophone,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons'
import { Menu, Transition } from '@headlessui/react'
import { t } from 'i18next'

const DropdownContent: FC<DropdownContentProps> = ({ username, status, ...props }) => {
  const dispatch = useDispatch<Dispatch>()
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  const { inputOutputOpened } = useSelector((state: RootState) => state.island)

  const videoElement: any = useRef<HTMLVideoElement | null>(null)

  const gotStream = () => {}
  const gotDevices = () => {}
  const handleError = (error: Error) => {
    console.log('Error:', error.message, error.name)
  }

  const attachSinkId = (element: HTMLVideoElement, sinkId: string) => {
  }


  const handleClickInputMenu = () => {
    if (inputOutputOpened) {
      dispatch.island.toggleInputOutputOpened(false)
    } else {
      dispatch.island.toggleInputOutputOpened(true)
    }
    // setMenuDeviceIsOpen(!menuDeviceIsOpen)
  }

  const [selectedAudioInput, setSelectedAudioInput] = useState<string | null>(null)
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string | null>(null)

  const handleClickInsideMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const handleClickAudioInput = (audioInputDevice: string) => {
    setSelectedAudioInput(audioInputDevice)
    const constraints = {
      audio: { deviceId: audioInputDevice ? { exact: audioInputDevice } : undefined },
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStream)
      .then(gotDevices)
      .catch(handleError)
  }

  const handleClickAudioOutput = (audioOutputDevice: string) => {
    setSelectedAudioOutput(audioOutputDevice)
    attachSinkId(videoElement?.current, audioOutputDevice)
  }

  const [actualDevice, setActualDevice]: any = useState([])

  const enumerareDispositivi = () => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos) => {

        setActualDevice(deviceInfos)
        setActualDevice(deviceInfos.sort((a, b) => (a.deviceId === selectedAudioOutput ? -1 : 1)))
      })
      .catch((error) => {
        console.error("error", error)
      })
  }

  useEffect(() => {
    enumerareDispositivi()
  }, [])

  const handleClickDevice = (device: string) => {
    setSelectedDevice(device)
  }

  return (
    <>
      <Menu as='div' className='relative inline-block text-left' data-stop-propagation={true}>
        <Menu.Button className='pi-absolute pi-right-[3rem] pi-bottom-[2.5rem] pi-bg-transparent enabled:hover:pi-bg-gray-500 focus:pi-ring-gray-500 pi-flex pi-font-sans pi-font-light pi-content-center pi-items-center pi-justify-center pi-tracking-wide pi-duration-200 pi-transform pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-text-white pi-border pi-border-transparent focus:pi-ring-offset-black pi-rounded-full pi-text-sm pi-leading-4 pi-h-12 pi-w-12 pi-col-start-auto pi-transition-color pi-shrink-0'>
          <FontAwesomeIcon size='xl' icon={faEllipsis} className='pi-text-gray-100' />
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
            className='pi-z-50 pi-absolute pi-top-0 pi-right-[-8rem] pi-mt-2 pi-w-56 pi-origin-top-right pi-rounded-md pi-bg-black pi-shadow-lg pi-ring-1 pi-ring-black pi-ring-opacity-5 pi-focus:outline-none pi-cursor-auto '
            data-stop-propagation={true}
          >
            <div className=''>
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
                        className={`pi-flex pi-py-2 ${active ? 'pi-bg-gray-700' : ''}`}
                        onClick={() => handleClickAudioInput(audioDevice.deviceId)}
                        data-stop-propagation={true}
                      >
                        {/* faCheck on selectedAudioInput */}
                        {selectedAudioInput === audioDevice?.deviceId && (
                          <FontAwesomeIcon
                            size='lg'
                            icon={faCheck}
                            className='pi-text-green-400 pi-mr-1'
                          />
                        )}

                        {/* faCheck if user has no selectedAudioInput and audioDevice is default */}
                        {!selectedAudioInput && audioDevice?.deviceId === 'default' && (
                          <FontAwesomeIcon
                            size='lg'
                            icon={faCheck}
                            className='pi-text-green-400 pi-mr-1'
                          />
                        )}

                        <FontAwesomeIcon
                          size='lg'
                          icon={faMicrophone}
                          className={`${
                            selectedAudioInput !== null &&
                            selectedAudioInput !== '' &&
                            selectedAudioInput !== audioDevice?.deviceId
                              ? 'pi-ml-5'
                              : selectedAudioInput !== '' &&
                                selectedAudioInput !== null &&
                                selectedAudioInput === audioDevice?.deviceId
                              ? ''
                              : selectedAudioInput === null && audioDevice?.deviceId !== 'default'
                              ? 'pi-ml-5'
                              : ''
                          } pi-text-gray-100 pi-mr-1`}
                        />
                        <div className='pi-text-gray-50'>
                          {audioDevice?.label || `Device ${index + 1}`}
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                ))}
              <div className='pi-relative pi-py-2'>
                <div className='pi-absolute pi-inset-0 pi-flex pi-items-center' aria-hidden='true'>
                  <div className='pi-w-full pi-border-t pi-border-gray-300' />
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
                        className={`pi-flex pi-py-2 ${active ? 'pi-bg-gray-700' : ''}`}
                        onClick={() => handleClickAudioOutput(audioDevice?.deviceId)}
                        data-stop-propagation={true}
                      >
                        {/* faCheck on selectedAudioOutput */}
                        {selectedAudioOutput === audioDevice?.deviceId && (
                          <FontAwesomeIcon
                            size='lg'
                            icon={faCheck}
                            className='pi-text-green-400 pi-mr-1'
                          />
                        )}

                        {/* faCheck if user has no selectedAudioInput and audioDevice is default */}
                        {!selectedAudioOutput && audioDevice?.deviceId === 'default' && (
                          <FontAwesomeIcon
                            size='lg'
                            icon={faCheck}
                            className='pi-text-green-400 pi-mr-1'
                          />
                        )}

                        <FontAwesomeIcon
                          size='lg'
                          icon={faVolumeHigh}
                          className={`${
                            selectedAudioOutput !== null &&
                            selectedAudioOutput !== '' &&
                            selectedAudioOutput !== audioDevice?.deviceId
                              ? 'pi-ml-5'
                              : selectedAudioOutput !== '' &&
                                selectedAudioOutput !== null &&
                                selectedAudioOutput === audioDevice?.deviceId
                              ? ''
                              : selectedAudioOutput === null && audioDevice?.deviceId !== 'default'
                              ? 'pi-ml-5'
                              : ''
                          } pi-text-gray-100 pi-mr-1`}
                        />

                        {/* <FontAwesomeIcon
                          size='lg'
                          icon={faMicrophone}
                          className='pi-text-gray-100 pi-mr-2'
                        /> */}
                        <div className='pi-text-gray-50'>
                          {audioDevice?.label || `Device ${index + 1}`}
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
    </>
  )
}

interface DropdownContentProps extends ComponentProps<'div'> {
  username?: string
  status?: string
}

export default DropdownContent
