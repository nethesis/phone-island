// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Meta, StoryObj } from '@storybook/react'
import React, { useEffect, useState } from 'react'
import { PhoneIsland } from '../App'
import { eventDispatch, useEventListener } from '../utils'
import { store } from '../store'
import { Button } from '../components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faDownLeftAndUpRightToCenter,
  faMoon,
  faPhone,
  faSun,
  faTimes,
  faWifi,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { faGridRound } from '@nethesis/nethesis-solid-svg-icons'

const meta: Meta<typeof PhoneIsland> = {
  title: 'Phone Island',
  component: PhoneIsland,
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const CallTemplate = (args: any) => {
  const [eventName, setEventName] = useState('phone-island-recording-open')
  //take the number from input field
  const [number, setNumber] = useState('*43')
  const [token, setToken] = useState(() => {
    return localStorage.getItem('phoneIslandToken') || ''
  })
  const [key, setKey] = useState('0')
  const [device, setDevice] = useState('default')
  const [logData, setLogData] = useState('')
  const [userData, setUserData] = useState('')
  const [phoneIslandData, setPhoneIslandData] = useState('')
  const [phoneIslandWebrtc, setPhoneIslandWebrtc] = useState('')
  const [theme, setTheme] = useState('system')

  const [showLog, setShowLog] = useState(false)
  const [showUserData, setShowUserData] = useState({})
  const [showPhoneIslandStatus, setShowPhoneIslandStatus] = useState(false)
  const [showPhoneIslandWebrtc, setShowPhoneIslandWebrtc] = useState(false)

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const [showKeyboards, setShowKeyboards] = useState(false)

  const [isSmallView, setIsSmallView] = useState(true)

  useEffect(() => {
    localStorage.setItem('phoneIslandToken', token)
  }, [token])

  const openKeypad = () => {
    setShowKeyboards(!showKeyboards)
    if (showKeyboards) {
      eventDispatch('phone-island-call-keypad-close', {})
    } else {
      eventDispatch('phone-island-call-keypad-open', {})
    }
  }

  const logCallStore = () => {
    //hide the log if it is already shown
    if (showLog) {
      setLogData('')
      setShowLog(false)
      return
    } else {
      setShowLog(true)
      const currentCallStoreValue = store.getState().currentCall
      setLogData(JSON.stringify(currentCallStoreValue, null, 2))
    }
  }

  const logUserStore = () => {
    //hide user informations it is already shown
    if (showUserData) {
      setUserData('')
      setShowUserData(false)
      return
    } else {
      setShowUserData(true)
      const currentUserStoreData = store.getState().currentUser
      setUserData(JSON.stringify(currentUserStoreData, null, 2))
    }
  }

  const logPhoneIslandStatus = () => {
    //hide user informations it is already shown
    if (showPhoneIslandStatus) {
      setPhoneIslandData('')
      setShowPhoneIslandStatus(false)
      return
    } else {
      setShowPhoneIslandStatus(true)
      const currentPhoneIslandStoreData = store.getState().island
      setPhoneIslandData(JSON.stringify(currentPhoneIslandStoreData, null, 2))
    }
  }

  const logPhoneIslandWebrtc = () => {
    //hide user informations it is already shown
    if (showPhoneIslandWebrtc) {
      setPhoneIslandWebrtc('')
      setShowPhoneIslandWebrtc(false)
      return
    } else {
      setShowPhoneIslandWebrtc(true)
      const currentPhoneIslandStoreWebrtcData = store.getState().webrtc
      setPhoneIslandWebrtc(JSON.stringify(currentPhoneIslandStoreWebrtcData, null, 2))
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    eventDispatch('phone-island-theme-change', { selectedTheme: newTheme })
  }

  const closeToast = () => {
    setShowToast(false)
  }

  const handleEventDispatch = () => {
    eventDispatch(eventName, { number, key, deviceId: device })
  }

  useEventListener('phone-island-call-ringing', () => {
    setShowToast(true)
    setToastMessage('The call is ringing...')
  })

  const [showUI, setShowUI] = useState(false)
  useEventListener('phone-island-webrtc-registered', () => {
    console.log('Phone island is registered...')
    setShowUI(true)
    setToastMessage('Phone island is registered...')
  })

  useEventListener('phone-island-detached', () => {
    setShowUI(false)
    setToastMessage('Phone island is detached...')
  })

  useEventListener('phone-island-action-physical', (data) => {
    console.log('Phone island physical call', data)
    setToastMessage('Phone island physical action...')
  })

  const toastNotification = () => {
    return (
      <div className='pi-fixed pi-bottom-4 pi-right-4 pi-bg-white pi-rounded-lg pi-shadow-lg pi-p-4 pi-flex pi-items-center pi-gap-2'>
        <div className='pi-flex pi-items-center'>
          <FontAwesomeIcon icon={faCheck} size='lg' className='pi-text-green-500 pi-bg-green-400' />
          <span className='pi-ml-2'>{toastMessage}</span>
        </div>
        <button onClick={closeToast} className='pi-text-red-600 hover:pi-text-red-800'>
          <FontAwesomeIcon icon={faTimes} size='lg' />
        </button>
      </div>
    )
  }

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        closeToast()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [showToast])

  const dtmfKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ]

  const handleDtmfButtonClick = (key: string) => {
    setKey(key)
    eventDispatch('phone-island-call-keypad-send', { key })
  }

  const renderDtmfKeypad = () => {
    return (
      <div className='pi-bg-white pi-rounded-lg pi-shadow-md pi-p-4'>
        <div className='pi-grid pi-grid-cols-3 pi-gap-2'>
          {dtmfKeys.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((key) => (
                <Button key={key} onClick={() => handleDtmfButtonClick(key)} variant='default'>
                  {key}
                </Button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  const openOrReducePhoneIsland = () => {
    //retrieve size value from the store
    if (isSmallView) {
      console.log('entrato qui', isSmallView)
      eventDispatch('phone-island-expand', {})
      setIsSmallView(false)
    } else {
      eventDispatch('phone-island-compress', {})
      setIsSmallView(true)
    }
  }

  const handleCreateEvent = (alertType: string) => {
    eventDispatch('phone-island-alert', alertType)
  }

  const eventOptions = [
    { value: '', label: 'Select an event' },
    { value: 'call_transferred', label: 'Call Transferred' },
    { value: 'busy_camera', label: 'Busy Camera' },
    { value: 'socket_down', label: 'Socket Down' },
    { value: 'webrtc_down', label: 'WebRTC Down' },
    { value: 'unknown_media_permissions', label: 'Unknown Media Permissions' },
    { value: 'user_permissions', label: 'User Permissions' },
    { value: 'browser_permissions', label: 'Browser Permissions' },
  ]

  const [alert, setAlert] = useState('')

  const handleInternetConnectionCheck = () => {
    eventDispatch('phone-island-check-connection', {})
  }

  return (
    <>
      <div className='pi-flex pi-flex-col pi-gap-4 pi-w-full pi-max-w-lg pi-mx-auto pi-p-6 pi-bg-gray-100 pi-rounded-lg pi-overflow-auto pi-mt-4'>
        <div className='pi-flex pi-justify-center'>
          <input
            data-stop-propagation={true}
            type='text'
            onChange={(e) => setToken(e.target.value)}
            value={token}
            placeholder='Enter a valid token'
            autoFocus
            spellCheck={false}
            className='pi-w-full pi-rounded-full dark:pi-bg-gray-950 pi-bg-gray-50 pi-border-2 pi-border-emerald-500 dark:pi-border-emerald-200 active:pi-border-emerald-500 dark:active:focus:pi-border-emerald-200 pi-text-gray-700 dark:pi-text-white pi-font-light pi-text-xl pi-text-center pi-px-2 focus:pi-outline-0 focus:pi-ring-0 pi-placeholder-gray-800 dark:pi-placeholder-gray-200 pi-placeholder-text-xs'
          />
        </div>
        {showUI && (
          <>
            <div className='pi-flex pi-justify-between pi-gap-2'>
              <button
                onClick={logCallStore}
                className='pi-btn pi-bg-emerald-700 pi-text-white pi-rounded-md'
              >
                {showLog ? 'Hide call log' : 'Show call log'}
              </button>

              <button
                onClick={logUserStore}
                className='pi-btn pi-bg-emerald-700 pi-text-white pi-rounded-md'
              >
                {showUserData ? 'Hide user data' : 'Show user data'}
              </button>

              <button
                onClick={logPhoneIslandStatus}
                className='pi-btn pi-bg-emerald-700 pi-text-white pi-rounded-md'
              >
                {showPhoneIslandStatus ? 'Hide phone island status' : 'Show phone island status'}
              </button>

              <button
                onClick={logPhoneIslandWebrtc}
                className='pi-btn pi-bg-emerald-700 pi-text-white pi-rounded-md'
              >
                {showPhoneIslandWebrtc
                  ? 'Hide phone island webrtc status'
                  : 'Show phone island webrtc status'}
              </button>

              <button
                onClick={toggleTheme}
                className='pi-btn pi-bg-gray-700 pi-text-white pi-rounded-md 
             pi-py-2 pi-px-4 pi-flex pi-items-center 
             hover:pi-bg-gray-800 pi-transition pi-duration-200'
              >
                <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className='pi-mr-2' />
                Toggle Theme
              </button>
            </div>

            {logData && (
              <pre className='pi-bg-gray-200 pi-p-4 pi-rounded-md pi-overflow-auto pi-text-xs'>
                {logData}
              </pre>
            )}

            {userData && (
              <pre className='pi-bg-gray-200 pi-p-4 pi-rounded-md pi-overflow-auto pi-text-xs'>
                {userData}
              </pre>
            )}

            {phoneIslandData && (
              <pre className='pi-bg-gray-200 pi-p-4 pi-rounded-md pi-overflow-auto pi-text-xs'>
                {phoneIslandData}
              </pre>
            )}

            {phoneIslandWebrtc && (
              <pre className='pi-bg-gray-200 pi-p-4 pi-rounded-md pi-overflow-auto pi-text-xs'>
                {phoneIslandWebrtc}
              </pre>
            )}

            <div className='pi-bg-white pi-rounded-lg pi-shadow-md pi-p-4'>
              <h2 className='pi-text-xl pi-font-semibold pi-mb-2'>Call Actions</h2>
              <label className='pi-block pi-mb-2'>Number to Call</label>
              <div className='pi-flex pi-items-center pi-gap-2'>
                <input
                  data-stop-propagation={true}
                  type='text'
                  onChange={(e) => setNumber(e.target.value)}
                  value={number}
                  placeholder='Enter a number'
                  autoFocus
                  spellCheck={false}
                  className='pi-w-full pi-rounded-full dark:pi-bg-gray-950 pi-bg-gray-50 pi-border-2 pi-border-emerald-500 dark:pi-border-emerald-200 active:pi-border-emerald-500 dark:active:focus:pi-border-emerald-200 pi-text-gray-700 dark:pi-text-white pi-font-light pi-text-xl pi-text-center pi-px-2 focus:pi-outline-0 focus:pi-ring-0 pi-placeholder-gray-800 dark:pi-placeholder-gray-200 pi-placeholder-text-xs'
                />
                <Button
                  onClick={() => eventDispatch('phone-island-call-start', { number })}
                  variant='green'
                  data-tooltip-id='tooltip-left'
                  data-tooltip-content={t('Tooltip.Answer') || ''}
                >
                  <FontAwesomeIcon icon={faPhone} className='pi-h-6 pi-w-6' />
                </Button>
                <Button
                  onClick={() => eventDispatch('phone-island-call-end', {})}
                  variant='red'
                  data-tooltip-id='tooltip-left'
                  data-tooltip-content={t('Tooltip.Answer') || ''}
                >
                  <FontAwesomeIcon icon={faPhone} className='pi-h-6 pi-w-6' />
                </Button>
                {/* Alert list to send */}
                <div className='flex flex-1 justify-end px-4 sm:px-6'>
                  <select
                    data-stop-propagation={true}
                    onChange={(e) => setAlert(e.target.value)}
                    value={alert}
                    className='pi-w-full pi-rounded-full dark:pi-bg-gray-950 pi-bg-gray-50 pi-border-2 pi-border-emerald-500 dark:pi-border-emerald-200 active:pi-border-emerald-500 dark:active:focus:pi-border-emerald-200 pi-text-gray-700 dark:pi-text-white pi-font-light pi-text-xl pi-text-center pi-px-2 focus:pi-outline-0 focus:pi-ring-0 pi-placeholder-gray-800 dark:pi-placeholder-gray-200 pi-placeholder-text-xs'
                  >
                    {eventOptions?.map((event) => (
                      <option key={event.value} value={event.value} disabled={event.value === ''}>
                        {event.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant='default'
                    onClick={() => handleCreateEvent(alert)}
                    disabled={!alert}
                  >
                    <FontAwesomeIcon icon={faMoon} className='pi-h-6 pi-w-6' />
                  </Button>
                </div>
              </div>
              <div className='pi-flex pi-justify-center pi-mt-2'>
                <Button
                  variant='default'
                  onClick={openKeypad}
                  data-tooltip-id='tooltip-keyboard'
                  data-tooltip-content={t('Tooltip.Keyboard') || ''}
                >
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faGridRound} />
                </Button>

                <Button
                  variant='default'
                  onClick={() => openOrReducePhoneIsland()}
                  data-tooltip-id='tooltip-open-close-phone-island'
                  data-tooltip-content={
                    isSmallView ? t('Tooltip.Reduce') || '' : t('Tooltip.Open') || ''
                  }
                  className='pi-ml-2'
                >
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faDownLeftAndUpRightToCenter} />
                </Button>
                
                <Button
                  variant='default'
                  onClick={() => handleInternetConnectionCheck()}
                  className='pi-ml-2'
                >
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faWifi} />
                </Button>
              </div>
              {showKeyboards && (
                <div className='pi-flex pi-justify-center pi-my-4'>{renderDtmfKeypad()}</div>
              )}
            </div>

            <div className='pi-bg-white pi-rounded-lg pi-shadow-md pi-p-4'>
              <label className='pi-block pi-mb-2'>Event Name</label>
              <select
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className='pi-w-full pi-px-3 pi-py-2 pi-border pi-rounded-md pi-mt-2'
              >
                <option value='phone-island-recording-open'>Recording Open</option>
                <option value='phone-island-call-keypad-send'>Send Keypad</option>
                <option value='phone-island-audio-player-start'>Start Audio</option>
              </select>

              <div className='pi-mt-4 pi-flex pi-justify-center'>
                <Button onClick={handleEventDispatch} variant='default'>
                  <FontAwesomeIcon icon={faCheck} className='pi-h-6 pi-w-6' />
                </Button>
              </div>
            </div>
          </>
        )}

        {token && (
          <PhoneIsland
            dataConfig={token.toString()}
            showAlways={false}
            {...args}
            uaType={'desktop'}
          />
        )}
        {/* Toast Notification */}
        {showToast && <>{toastNotification()}</>}
      </div>
    </>
  )
}

export const Call: StoryObj<typeof PhoneIsland> = {
  render: (args) => <CallTemplate {...args} />,
  args: {},
}
Call.args = {}
