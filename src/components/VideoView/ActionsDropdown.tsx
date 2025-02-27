// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, Fragment } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faEllipsis,
  faMicrophone,
  faMoon,
  faSun,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { t } from 'i18next'
import { isWebRTC } from '../../lib/user/default_device'
import { eventDispatch, setJSONItem, useEventListener } from '../../utils'
import { Tooltip } from 'react-tooltip'

//// remove unused code

const DropdownContent: FC = () => {
  const { sipcall }: any = useSelector((state: RootState) => state.webrtc)

  const handleClickAudioInput = (audioInputDevice: string) => {
    ////
  }

  const handleClickAudioOutput = (audioOutputDevice: string) => {
    ////
  }

  return (
    <>
      {isWebRTC() ? (
        <Menu
          as='div'
          className='relative inline-block text-left'
          data-stop-propagation={true}
          data-tooltip-id='tooltip-left-settings-devices'
          data-tooltip-content={t('Tooltip.Settings')}
        >
          <MenuButton
            className='pi-bg-transparent dark:enabled:hover:pi-bg-gray-600/30 enabled:hover:pi-bg-gray-200/70  dark:focus:pi-ring-gray-500 focus:pi-ring-gray-400 pi-flex pi-font-light pi-content-center pi-items-center pi-justify-center pi-tracking-wide pi-duration-200 pi-transform pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 dark:pi-text-white pi-text-gray-600 pi-border pi-border-transparent focus:pi-ring-offset-gray-200 dark:focus:pi-ring-offset-black pi-rounded-full pi-text-sm pi-leading-4 pi-h-12 pi-w-12 pi-col-start-auto pi-transition-color pi-shrink-0'
            data-stop-propagation={true}
          >
            <FontAwesomeIcon
              size='xl'
              icon={faEllipsis}
              className='dark:pi-text-gray-200 pi-text-gray-700'
              data-stop-propagation={true}
            />
          </MenuButton>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <MenuItems
              className={`${transferring ? 'pi-right-[1.5rem]' : 'pi-right-[4.5rem]'} 
              ${
                isListen
                  ? 'pi-max-h-[9.125rem] pi-mt-[-8.5rem]'
                  : 'pi-max-h-[13.125rem] pi-mt-[-12.5rem]'
              }
               pi-z-50 pi-absolute pi-w-56 pi-origin-top-right pi-rounded-md pi-shadow-lg pi-ring-1 dark:pi-bg-gray-950 pi-bg-gray-50 pi-bg-opacity-[0.99] dark:pi-bg-opacity-[0.99] pi-ring-black pi-ring-opacity-5 pi-focus:outline-none pi-cursor-auto pi-border-gray-300 dark:pi-border-gray-600 pi-border pi-py-2 pi-overflow-y-auto pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25`}
              data-stop-propagation={true}
            >
              <div className='' data-stop-propagation={true}>
                {!isListen && (
                  <>
                    {' '}
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
                                    : selectedAudioInput === null &&
                                      audioDevice?.deviceId !== 'default'
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
                    {/* Divider  */}
                    <div className='pi-relative pi-py-2'>
                      <div
                        className='pi-absolute pi-inset-0 pi-flex pi-items-center'
                        aria-hidden='true'
                      >
                        <div className='pi-w-full pi-border-t pi-border-gray-400 dark:pi-border-gray-600' />
                      </div>
                    </div>
                  </>
                )}

                {/* Speaker */}
                <div
                  className='pi-font-semibold dark:pi-text-gray-50 pi-text-gray-600 pi-py-1 pi-px-4'
                  data-stop-propagation={true}
                >
                  {t('DropdownContent.Speakers')}
                </div>
                {actualDevice
                  .filter((device) => device?.kind === 'audiooutput')
                  .map((audioDevice, index) => (
                    <MenuItem key={index}>
                      {({ active }: any) => (
                        <div
                          className={`pi-flex pi-py-2 pi-px-2 ${
                            active ? 'pi-bg-gray-200 dark:pi-bg-gray-700' : ''
                          }`}
                          onClick={() => handleClickAudioOutput(audioDevice?.deviceId)}
                          data-stop-propagation={true}
                        >
                          {/* faCheck on selectedAudioOutput */}
                          {selectedAudioOutput === audioDevice?.deviceId && (
                            <FontAwesomeIcon
                              size='lg'
                              icon={faCheck}
                              className='pi-text-green-600 dark:pi-text-green-400 pi-mr-2'
                            />
                          )}

                          {/* faCheck if user has no selectedAudioInput and audioDevice is default */}
                          {!selectedAudioOutput && audioDevice?.deviceId === 'default' && (
                            <FontAwesomeIcon
                              size='lg'
                              icon={faCheck}
                              className='pi-text-green-600 dark:pi-text-green-400 pi-mr-2'
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
                            } dark:pi-text-gray-100 pi-text-gray-600 pi-mr-1`}
                          />

                          <div
                            className={`${
                              active
                                ? 'dark:pi-text-gray-50 pi-text-gray-900'
                                : 'dark:pi-text-gray-50 pi-text-gray-700'
                            }`}
                          >
                            {audioDevice?.label || `Output device ${index + 1}`}
                          </div>
                        </div>
                      )}
                    </MenuItem>
                  ))}
                {/* Divider  */}
                <div className='pi-relative pi-py-2'>
                  <div
                    className='pi-absolute pi-inset-0 pi-flex pi-items-center'
                    aria-hidden='true'
                  >
                    <div className='pi-w-full pi-border-t pi-border-gray-400 dark:pi-border-gray-600' />
                  </div>
                </div>
                {/* theme selection */}
                <div
                  className='pi-font-semibold dark:pi-text-gray-50 pi-text-gray-600 pi-py-1 pi-px-4'
                  data-stop-propagation={true}
                >
                  {t('DropdownContent.Theme')}
                </div>

                {/* dark theme  */}
                <div
                  className={`pi-flex pi-py-2 pi-px-2 dark:hover:pi-text-gray-50 hover:pi-text-gray-900 dark:pi-text-gray-50 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700`}
                  onClick={() => handleSelectTheme('dark')}
                  data-stop-propagation={true}
                >
                  {theme === 'dark' && (
                    <FontAwesomeIcon
                      size='lg'
                      icon={faCheck}
                      className='pi-text-green-600 dark:pi-text-green-400 pi-mr-[0.57rem]'
                    />
                  )}
                  <FontAwesomeIcon
                    size='lg'
                    icon={faMoon}
                    className={`${
                      theme !== 'dark' ? 'pi-ml-[1.49rem] pi-mr-[0.42rem]' : 'pi-mr-[0.4rem]'
                    } dark:pi-text-gray-100 pi-text-gray-600 `}
                  />

                  <div>{t('DropdownContent.Dark')}</div>
                </div>

                {/* light theme  */}
                <div
                  className={`pi-flex pi-py-2 pi-px-2 dark:hover:pi-text-gray-50 hover:pi-text-gray-900 dark:pi-text-gray-50 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700`}
                  onClick={() => handleSelectTheme('light')}
                  data-stop-propagation={true}
                >
                  {theme === 'light' && (
                    <FontAwesomeIcon
                      size='lg'
                      icon={faCheck}
                      className='pi-text-green-600 dark:pi-text-green-400 pi-mr-[0.4rem]'
                    />
                  )}

                  <FontAwesomeIcon
                    size='lg'
                    icon={faSun}
                    className={`${
                      theme !== 'light' ? 'pi-ml-[1.4rem] pi-mr-[0.27rem]' : 'pi-mr-[0.28rem]'
                    } dark:pi-text-gray-100 pi-text-gray-600 `}
                  />
                  <div>{t('DropdownContent.Light')}</div>
                </div>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      ) : (
        <div></div>
      )}
      <Tooltip className='pi-z-20' id='tooltip-left-settings-devices' place='left' />
    </>
  )
}

interface DeviceInputOutputTypes {
  deviceId: string
}

export default DropdownContent
