// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Meta, StoryObj } from '@storybook/react'
import React, { useEffect, useState } from 'react'
import { PhoneIsland } from '../App'
import { eventDispatch, useEventListener } from '../utils'
import { Button } from '../components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { store } from '../store'
import {
  faBullhorn,
  faCheck,
  faDownLeftAndUpRightToCenter,
  faGear,
  faHeadset,
  faMoon,
  faPhone,
  faSun,
  faTimes,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { faGridRound, faOpen } from '@nethesis/nethesis-solid-svg-icons'
import { Base64 } from 'js-base64'
import { isEmpty } from '../utils/genericFunctions/isEmpty'
import { setMainDevice } from '../services/user'

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

  const [tokenConfig, setTokenConfig] = useState<string[]>([])

  // Audio/Video device states
  const [selectedAudioInput, setSelectedAudioInput] = useState<any>('')
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<any>('')
  const [selectedVideoInput, setSelectedVideoInput] = useState<any>('')
  const [audioInputs, setAudioInputs] = useState<any[]>([])
  const [audioOutputs, setAudioOutputs] = useState<any[]>([])
  const [videoInputs, setVideoInputs] = useState<any[]>([])

  useEffect(() => {
    localStorage.setItem('phoneIslandToken', token)
    const config = Base64.atob(token || '').split(':')
    setTokenConfig(config)
  }, [token])

  // Get stored device values from localStorage
  const getStoredDeviceValues = () => {
    try {
      const audioInputStored = localStorage.getItem('phone-island-audio-input-device')
      const audioOutputStored = localStorage.getItem('phone-island-audio-output-device')
      const videoInputStored = localStorage.getItem('phone-island-video-input-device')

      return {
        audioInput: audioInputStored ? JSON.parse(audioInputStored) : null,
        audioOutput: audioOutputStored ? JSON.parse(audioOutputStored) : null,
        videoInput: videoInputStored ? JSON.parse(videoInputStored) : null,
      }
    } catch (error) {
      console.error('Error parsing stored device values:', error)
      return { audioInput: null, audioOutput: null, videoInput: null }
    }
  }

  // Save device to localStorage
  const saveDeviceToStorage = (key: string, deviceId: string) => {
    try {
      localStorage.setItem(key, JSON.stringify({ deviceId }))
    } catch (error) {
      console.error('Error saving device to localStorage:', error)
    }
  }

  // Enumerate devices
  useEffect(() => {
    const checkInputOutputDevices = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos) => {
          const audioInputs = deviceInfos.filter((device) => device.kind === 'audioinput')
          const audioOutputs = deviceInfos.filter((device) => device.kind === 'audiooutput')
          const videoInputs = deviceInfos.filter((device) => device.kind === 'videoinput')
          setAudioInputs(audioInputs)
          setAudioOutputs(audioOutputs)
          setVideoInputs(videoInputs)
        })
        .catch((error) => {
          console.error('Error enumerating devices:', error)
        })
    }

    checkInputOutputDevices()

    navigator.mediaDevices.addEventListener('devicechange', checkInputOutputDevices)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', checkInputOutputDevices)
    }
  }, [])

  // Set stored devices when devices are loaded
  useEffect(() => {
    const storedValues = getStoredDeviceValues()

    if (storedValues.audioInput && audioInputs.length > 0) {
      const storedAudioInput = audioInputs.find(
        (device) => device.deviceId === storedValues.audioInput.deviceId,
      )
      if (storedAudioInput) {
        setSelectedAudioInput(storedAudioInput)
      }
    }
  }, [audioInputs])

  useEffect(() => {
    const storedValues = getStoredDeviceValues()

    if (storedValues.audioOutput && audioOutputs.length > 0) {
      const storedAudioOutput = audioOutputs.find(
        (device) => device.deviceId === storedValues.audioOutput.deviceId,
      )
      if (storedAudioOutput) {
        setSelectedAudioOutput(storedAudioOutput)
      }
    }
  }, [audioOutputs])

  useEffect(() => {
    const storedValues = getStoredDeviceValues()

    if (storedValues.videoInput && videoInputs.length > 0) {
      const storedVideoInput = videoInputs.find(
        (device) => device.deviceId === storedValues.videoInput.deviceId,
      )
      if (storedVideoInput) {
        setSelectedVideoInput(storedVideoInput)
      }
    }
  }, [videoInputs])

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

  useEventListener('phone-island-call-answered', (deviceType: any) => {
    setToastMessage(`Call answered from: ${deviceType?.extensionType}`)
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        eventDispatch('phone-island-call-start', { number })
      } else if (e.key === 'Delete') {
        eventDispatch('phone-island-call-end', {})
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [number])

  //example of object to play audio file
  let objectPlayAudioFile = {
    type: 'announcement',
    id: '76',
  }

  const [mainDeviceType, setMainDeviceType] = useState('')
  const [noMobileListDevice, setNoMobileListDevice]: any = useState([])
  const { endpoints, default_device } = store.getState().currentUser
  useEffect(() => {
    if (endpoints) {
      let extensionObj: any = endpoints
      if (default_device?.id && !isEmpty(extensionObj)) {
        const extensionType = extensionObj.extension.find(
          (ext: any) => ext.id === default_device?.id,
        )
        if (extensionType?.type !== '') {
          setMainDeviceType(extensionType?.type)
        }
      }
      if (!isEmpty(extensionObj)) {
        const filteredDevices = extensionObj?.extension?.filter(
          (device: any) => device?.type !== 'mobile',
        )
        setNoMobileListDevice(filteredDevices)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [default_device])

  const setMainDeviceId = async (device: any) => {
    let deviceExtension: any = {}
    if (device) {
      deviceExtension.id = device?.id
      try {
        const response = await setMainDevice(deviceExtension)
        if (response) {
          window.location.reload()
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  function playFileAudio() {
    let objectPlayAudioFile = {
      type: 'announcement',
      id: '4',
    }
    eventDispatch('phone-island-audio-player-start', { ...objectPlayAudioFile })
  }

  return (
    <div className='pi-flex pi-flex-col pi-gap-4 pi-max-w-[100rem] pi-mx-auto pi-p-6 pi-bg-gray-50 pi-rounded-xl pi-shadow-sm pi-overflow-y-auto'>
      {/* Token Section */}
      <div className='pi-space-y-2'>
        <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700'>
          Authentication Token
        </label>
        <input
          type='text'
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder='Insert token'
          className='pi-w-full pi-pl-4 pi-py-3 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500 focus:pi-border-emerald-500 pi-transition-colors'
        />
      </div>

      {showUI && (
        <>
          {/* user info */}
          <div className='pi-flex pi-text-sm pi-gap-4'>
            <div>Username: {tokenConfig[1]}</div>
            <div>Extension: {tokenConfig[3]}</div>
            <div>Host: {tokenConfig[0]}</div>
          </div>
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

              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-screen-share-status', {})}
                className='pi-text-sm pi-w-full'
              >
                Screen share status
              </Button>

              <Button
                variant='default'
                onClick={() => eventDispatch('phone-island-conference-status', {})}
                className='pi-text-sm pi-w-full'
              >
                Conference status
              </Button>

              <Button
                variant='red'
                onClick={() => eventDispatch('phone-island-recording-open', {})}
                className='pi-text-sm pi-w-full'
              >
                Recording announcement
              </Button>
              <Button
                variant='red'
                onClick={() => playFileAudio()}
                className='pi-text-sm pi-w-full'
              >
                Play announcement
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

          {/* Main device choose */}
          <div className='pi-bg-white pi-rounded-lg pi-shadow pi-p-4'>
            <h3 className='pi-text-lg pi-font-semibold pi-mb-3 pi-text-gray-800'>
              Device Selection
            </h3>
            <div className='pi-relative'>
              <select
                value={default_device?.id || ''}
                onChange={(e) => {
                  const device = noMobileListDevice.find((d) => d.id === e.target.value)
                  setMainDeviceId(device)
                }}
                className='pi-w-full pi-px-4 pi-py-2 pi-pl-10 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500 pi-bg-white pi-text-gray-700'
              >
                {noMobileListDevice
                  .filter((device: any) => device.type !== 'nethlink')
                  .sort((a: any, b: any) => {
                    const order = ['webrtc', 'physical']
                    return order.indexOf(a.type) - order.indexOf(b.type)
                  })
                  .map((device: any) => (
                    <option key={device.id} value={device.id}>
                      {device.id === default_device?.id ? '✓ ' : ''}
                      {device.type === 'webrtc' ? 'Web Phone' : device.description || 'Ip phone'}
                    </option>
                  ))}
              </select>
              <FontAwesomeIcon
                icon={faHeadset}
                className='pi-absolute pi-left-3 pi-top-1/2 pi-transform -pi-translate-y-1/2 pi-text-gray-500'
              />
            </div>
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
              <Button
                variant='default'
                onClick={() =>
                  eventDispatch('phone-island-view-changed', { viewType: 'waitingConference' })
                }
              >
                <FontAwesomeIcon icon={faUsers} className='pi-w-5 pi-h-5' />
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
            {/* Audio/Video Device Selection */}
            <div className='pi-bg-white pi-rounded-lg pi-shadow pi-p-4'>
              <h3 className='pi-text-lg pi-font-semibold pi-mb-4 pi-text-gray-800'>
                Audio and Video Settings
              </h3>

              {/* Audio Input Section */}
              <div className='pi-mb-4'>
                <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700 pi-mb-2'>
                  Microphone
                </label>
                <select
                  value={selectedAudioInput?.deviceId || ''}
                  className='pi-w-full pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500 pi-bg-white'
                  onChange={(e) => {
                    const device = audioInputs.find((input) => input.deviceId === e.target.value)
                    setSelectedAudioInput(device)
                    saveDeviceToStorage('phone-island-audio-input-device', e.target.value)
                    eventDispatch('phone-island-audio-input-change', { deviceId: e.target.value })
                  }}
                >
                  <option value=''>Select audio input</option>
                  {audioInputs.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Audio Output Section */}
              <div className='pi-mb-4'>
                <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700 pi-mb-2'>
                  Speaker
                </label>
                <select
                  value={selectedAudioOutput?.deviceId || ''}
                  className='pi-w-full pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500 pi-bg-white'
                  onChange={(e) => {
                    const device = audioOutputs.find((output) => output.deviceId === e.target.value)
                    setSelectedAudioOutput(device)
                    saveDeviceToStorage('phone-island-audio-output-device', e.target.value)
                    eventDispatch('phone-island-audio-output-change', { deviceId: e.target.value })
                  }}
                >
                  <option value=''>Select audio output</option>
                  {audioOutputs.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Input Section */}
              <div className='pi-mb-4'>
                <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700 pi-mb-2'>
                  Camera
                </label>
                <select
                  value={selectedVideoInput?.deviceId || ''}
                  className='pi-w-full pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500 pi-bg-white'
                  onChange={(e) => {
                    const device = videoInputs.find((input) => input.deviceId === e.target.value)
                    setSelectedVideoInput(device)
                    saveDeviceToStorage('phone-island-video-input-device', e.target.value)
                    eventDispatch('phone-island-video-input-change', { deviceId: e.target.value })
                  }}
                >
                  <option value=''>Select video input</option>
                  {videoInputs.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
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
