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
  faBullhorn,
  faCheck,
  faDownLeftAndUpRightToCenter,
  faGear,
  faMoon,
  faPhone,
  faSun,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { faGridRound, faOpen } from '@nethesis/nethesis-solid-svg-icons'

const meta: Meta<typeof PhoneIsland> = {
  title: 'Phone Island',
  component: PhoneIsland,
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const CallTemplate = (args: any) => {
  //take the number from input field
  const [number, setNumber] = useState('*43')
  const [token, setToken] = useState(() => {
    return localStorage.getItem('phoneIslandToken') || ''
  })
  const [theme, setTheme] = useState('system')

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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    eventDispatch('phone-island-theme-change', { selectedTheme: newTheme })
  }

  const closeToast = () => {
    setShowToast(false)
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
    eventDispatch('phone-island-call-keypad-send', { key })
  }

  const openOrReducePhoneIsland = () => {
    //retrieve size value from the store
    if (isSmallView) {
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

  return (
    <div className='pi-flex pi-flex-col pi-gap-4 pi-w-full pi-max-w-[100rem] pi-mx-auto pi-p-6 pi-bg-gray-50 pi-rounded-xl pi-shadow-sm pi-overflow-y-auto'>
      {/* Token Section */}
      <div className='pi-space-y-2 pi-w-[98rem]'>
        <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700'>
          Authentication Token
        </label>
        <input
          type='text'
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder='Insert token'
          className='pi-w-full pi-px-4 pi-py-3 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500 focus:pi-border-emerald-500 pi-transition-colors'
        />
      </div>

      {showUI && (
        <>
          {/* Debug Controls */}
          <div className='pi-bg-white pi-rounded-lg pi-shadow pi-p-4'>
            <h3 className='pi-text-lg pi-font-semibold pi-mb-3 pi-text-gray-800'>Debug Tools</h3>
            <div className='pi-grid pi-grid-cols-2 md:pi-grid-cols-4 pi-gap-2'>
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-call-status', {})}
                className='pi-text-sm pi-w-full'
              >
                Call status
              </Button>
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-user-status', {})}
                className='pi-text-sm pi-w-full'
              >
                User status
              </Button>
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-all-users-status', {})}
                className='pi-text-sm pi-w-full'
              >
                All users status
              </Button>
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-status', {})}
                className='pi-text-sm pi-w-full'
              >
                Phone island status
              </Button>
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-webrtc-status', {})}
                className='pi-text-sm pi-w-full'
              >
                Webrtc status
              </Button>
              {/* Check player status */}
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-player-status', {})}
                className='pi-text-sm pi-w-full'
              >
                Player status
              </Button>
            </div>
          </div>

          {/* Call Controls */}
          <div className='pi-bg-white pi-rounded-lg pi-shadow pi-p-4'>
            <h3 className='pi-text-lg pi-font-semibold pi-mb-4 pi-text-gray-800'>Call check</h3>

            {/* Number Input Row */}
            <div className='pi-flex pi-gap-2 pi-mb-4'>
              <input
                type='text'
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder='Insert numbers'
                className='pi-flex-1 pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500'
              />
              <Button
                variant='green'
                onClick={() => eventDispatch('phone-island-call-start', { number })}
              >
                <FontAwesomeIcon icon={faPhone} className='pi-w-5 pi-h-5' />
              </Button>
              <Button variant='red' onClick={() => eventDispatch('phone-island-call-end', {})}>
                <FontAwesomeIcon icon={faPhone} className='pi-w-5 pi-h-5' />
              </Button>
            </div>

            {/* Utility Buttons */}
            <div className='pi-grid pi-grid-cols-3 pi-gap-2'>
              <Button variant='default' onClick={openKeypad}>
                <FontAwesomeIcon icon={faGridRound} className='pi-w-5 pi-h-5' />
              </Button>
              <Button variant='default' onClick={openOrReducePhoneIsland}>
                <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} className='pi-w-5 pi-h-5' />
              </Button>
              <Button variant='default' onClick={toggleTheme}>
                <FontAwesomeIcon
                  icon={theme === 'dark' ? faSun : faMoon}
                  className='pi-w-5 pi-h-5'
                />
              </Button>
            </div>

            {/* DTMF Keypad */}
            {showKeyboards && (
              <div className='pi-mt-4 pi-p-4 pi-bg-gray-50 pi-rounded-lg'>
                <div className='pi-grid pi-grid-cols-3 pi-gap-3'>
                  {dtmfKeys.flat().map((key) => (
                    <Button
                      variant='default'
                      key={key}
                      onClick={() => handleDtmfButtonClick(key)}
                      className='pi-py-3 pi-text-xl pi-font-medium'
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Controls */}
          <div className='pi-bg-white pi-rounded-lg pi-shadow pi-p-4'>
            <h3 className='pi-text-lg pi-font-semibold pi-mb-4 pi-text-gray-800'>View change</h3>

            {/* Utility Buttons */}
            <div className='pi-grid pi-grid-cols-3 pi-gap-2'>
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-view-changed', { viewType: 'call' })}
              >
                <FontAwesomeIcon icon={faPhone} className='pi-w-5 pi-h-5' />
              </Button>
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-view-changed', { viewType: 'settings' })}
              >
                <FontAwesomeIcon icon={faGear} className='pi-w-5 pi-h-5' />
              </Button>
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-view-changed', { viewType: 'settings' })}
              >
                <FontAwesomeIcon icon={faOpen} className='pi-w-5 pi-h-5' />
              </Button>
            </div>
          </div>

          {/* Audio Controls */}
          <div className='pi-bg-white pi-rounded-lg pi-shadow pi-p-4'>
            <h3 className='pi-text-lg pi-font-semibold pi-mb-4 pi-text-gray-800'>Audio change</h3>

            {/* Utility Buttons */}
            <div className='pi-grid pi-grid-cols-3 pi-gap-2'>
              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-player-force-stop', {})}
              >
                <FontAwesomeIcon icon={faBullhorn} className='pi-w-5 pi-h-5' />
              </Button>
            </div>
          </div>

          {/* Event Controls */}
          <div className='pi-bg-white pi-rounded-lg pi-shadow pi-p-4'>
            <h3 className='pi-text-lg pi-font-semibold pi-mb-3 pi-text-gray-800'>
              Events management
            </h3>
            <div className='pi-flex pi-gap-2'>
              <select
                value={alert}
                onChange={(e) => setAlert(e.target.value)}
                className='pi-flex-1 pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500 pi-w-max-12'
              >
                {eventOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={!option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                variant='default'
                onClick={() => handleCreateEvent(alert)}
                disabled={!alert}
                className='pi-min-w-[120px]'
              >
                Send
              </Button>
            </div>
          </div>

        </>
      )}

      <PhoneIsland dataConfig={token.toString()} showAlways={false} {...args} uaType={'desktop'} />

      {/* Toast Notification */}
      {showToast && (
        <div className='pi-fixed pi-bottom-6 pi-right-6 pi-animate-fade-in-up'>
          <div className='pi-bg-emerald-100 pi-border-l-4 pi-border-emerald-500 pi-text-emerald-700 pi-p-4 pi-rounded-lg pi-shadow-md pi-flex pi-items-center pi-gap-3'>
            <FontAwesomeIcon icon={faCheck} className='pi-text-emerald-600' />
            <span>{toastMessage}</span>
            <button onClick={closeToast} className='pi-text-emerald-600 hover:pi-text-emerald-800'>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const Call: StoryObj<typeof PhoneIsland> = {
  render: (args) => <CallTemplate {...args} />,
  args: {},
}
Call.args = {}
