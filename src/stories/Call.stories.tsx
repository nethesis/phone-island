// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Meta, StoryObj } from '@storybook/react'
import React, { useEffect, useState, useRef, useCallback } from 'react'
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
  faUser,
  faUsers,
  faChevronDown,
  faChevronRight,
  faTerminal,
  faTrash,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons'
import { faGridRound, faOpen } from '@nethesis/nethesis-solid-svg-icons'
import { Base64 } from 'js-base64'
import { isEmpty } from '../utils/genericFunctions/isEmpty'
import { setMainDevice, setIncomingCallsPreference } from '../services/user'

const meta: Meta<typeof PhoneIsland> = {
  title: 'Phone Island',
  component: PhoneIsland,
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

interface ConsoleLog {
  id: number
  timestamp: string
  type: 'event' | 'info' | 'error' | 'warning'
  message: string
}

const CallTemplate = (args: any) => {
  const [number, setNumber] = useState('*43')
  const [token, setToken] = useState(() => localStorage.getItem('phoneIslandToken') || '')
  const [theme, setTheme] = useState('system')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showKeyboards, setShowKeyboards] = useState(false)
  const [isSmallView, setIsSmallView] = useState(true)
  const [tokenConfig, setTokenConfig] = useState<string[]>([])
  const [showUI, setShowUI] = useState(false)
  const [alert, setAlert] = useState('')

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    call: true,
    console: true,
    network: false,
    debug: false,
    devices: false,
    events: false,
    views: false,
  })

  // Console logs state
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'event' | 'info' | 'error'>('all')
  const consoleEndRef = useRef<HTMLDivElement>(null)
  const logIdCounter = useRef(0)

  // Network simulation
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false)
  const originalFetch = useRef<typeof window.fetch>(window.fetch)
  const originalXHROpen = useRef<typeof XMLHttpRequest.prototype.open>(
    XMLHttpRequest.prototype.open,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Audio/Video device states
  const [selectedAudioInput, setSelectedAudioInput] = useState<any>('')
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<any>('')
  const [selectedVideoInput, setSelectedVideoInput] = useState<any>('')
  const [audioInputs, setAudioInputs] = useState<any[]>([])
  const [audioOutputs, setAudioOutputs] = useState<any[]>([])
  const [videoInputs, setVideoInputs] = useState<any[]>([])

  const [mainDeviceType, setMainDeviceType] = useState('')
  const [noMobileListDevice, setNoMobileListDevice]: any = useState([])
  const [urlOpenType, setUrlOpenType] = useState('never')
  const { endpoints, default_device } = store.getState().currentUser

  // Add log to console
  const addLog = (type: ConsoleLog['type'], message: string) => {
    const newLog: ConsoleLog = {
      id: logIdCounter.current++,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    }
    setConsoleLogs((prev) => [...prev, newLog])
  }

  // Auto scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [consoleLogs])

  // Intercept console methods
  useEffect(() => {
    const originalConsoleLog = console.log
    const originalConsoleInfo = console.info
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    console.log = (...args) => {
      addLog('info', args.join(' '))
      originalConsoleLog.apply(console, args)
    }

    console.info = (...args) => {
      addLog('info', args.join(' '))
      originalConsoleInfo.apply(console, args)
    }

    console.error = (...args) => {
      addLog('error', args.join(' '))
      originalConsoleError.apply(console, args)
    }

    console.warn = (...args) => {
      addLog('warning', args.join(' '))
      originalConsoleWarn.apply(console, args)
    }

    return () => {
      console.log = originalConsoleLog
      console.info = originalConsoleInfo
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
    }
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const clearConsole = () => {
    setConsoleLogs([])
  }



  useEffect(() => {
    localStorage.setItem('phoneIslandToken', token)
    const config = Base64.atob(token || '').split(':')
    setTokenConfig(config)
  }, [token])

  // Device enumeration
  useEffect(() => {
    const checkInputOutputDevices = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos) => {
          setAudioInputs(deviceInfos.filter((d) => d.kind === 'audioinput'))
          setAudioOutputs(deviceInfos.filter((d) => d.kind === 'audiooutput'))
          setVideoInputs(deviceInfos.filter((d) => d.kind === 'videoinput'))
        })
        .catch((error) => console.error('Error enumerating devices:', error))
    }

    checkInputOutputDevices()
    navigator.mediaDevices.addEventListener('devicechange', checkInputOutputDevices)
    return () =>
      navigator.mediaDevices.removeEventListener('devicechange', checkInputOutputDevices)
  }, [])

  // Set stored devices
  useEffect(() => {
    const getStoredDevice = (key: string) => {
      try {
        const stored = localStorage.getItem(key)
        return stored ? JSON.parse(stored) : null
      } catch {
        return null
      }
    }

    const audioInputStored = getStoredDevice('phone-island-audio-input-device')
    const audioOutputStored = getStoredDevice('phone-island-audio-output-device')
    const videoInputStored = getStoredDevice('phone-island-video-input-device')

    if (audioInputStored && audioInputs.length > 0) {
      const device = audioInputs.find((d) => d.deviceId === audioInputStored.deviceId)
      if (device) setSelectedAudioInput(device)
    }
    if (audioOutputStored && audioOutputs.length > 0) {
      const device = audioOutputs.find((d) => d.deviceId === audioOutputStored.deviceId)
      if (device) setSelectedAudioOutput(device)
    }
    if (videoInputStored && videoInputs.length > 0) {
      const device = videoInputs.find((d) => d.deviceId === videoInputStored.deviceId)
      if (device) setSelectedVideoInput(device)
    }
  }, [audioInputs, audioOutputs, videoInputs])

  // Event listeners - wrapped in useCallback to prevent setState during render
  const handleWebRTCRegistered = useCallback(() => {
    addLog('event', '✅ Phone island registered')
    setShowUI(true)
  }, [])

  const handleCallRinging = useCallback(() => {
    addLog('event', '📞 Call ringing')
  }, [])

  const handleCallAnswered = useCallback((data: any) => {
    addLog('event', `✅ Call answered from: ${data?.extensionType}`)
  }, [])

  const handleDetached = useCallback(() => {
    addLog('event', '❌ Phone island detached')
    setShowUI(false)
  }, [])

  useEventListener('phone-island-webrtc-registered', handleWebRTCRegistered)
  useEventListener('phone-island-call-ringing', handleCallRinging)
  useEventListener('phone-island-call-answered', handleCallAnswered)
  useEventListener('phone-island-detached', handleDetached)

  useEffect(() => {
    if (endpoints) {
      const extensionObj: any = endpoints
      if (default_device?.id && !isEmpty(extensionObj)) {
        const ext = extensionObj.extension.find((e: any) => e.id === default_device?.id)
        if (ext?.type) setMainDeviceType(ext.type)
      }
      if (!isEmpty(extensionObj)) {
        setNoMobileListDevice(
          extensionObj?.extension?.filter((d: any) => d?.type !== 'mobile') || [],
        )
      }
    }

    const { openParamUrlType } = store.getState().paramUrl
    if (openParamUrlType) setUrlOpenType(openParamUrlType)
  }, [default_device, endpoints])

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const dtmfKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ]

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

  const Section = ({
    title,
    id,
    children,
    badge,
  }: {
    title: string
    id: string
    children: React.ReactNode
    badge?: string
  }) => (
    <div className='pi-bg-white pi-rounded-lg pi-shadow-sm pi-border pi-border-gray-200'>
      <button
        onClick={() => toggleSection(id)}
        className='pi-w-full pi-px-4 pi-py-3 pi-flex pi-items-center pi-justify-between pi-text-left hover:pi-bg-gray-50 pi-transition-colors'
      >
        <div className='pi-flex pi-items-center pi-gap-2'>
          <FontAwesomeIcon
            icon={expandedSections[id] ? faChevronDown : faChevronRight}
            className='pi-text-gray-400 pi-text-sm'
          />
          <h3 className='pi-font-semibold pi-text-gray-800'>{title}</h3>
          {badge && (
            <span className='pi-px-2 pi-py-0.5 pi-text-xs pi-bg-emerald-100 pi-text-emerald-700 pi-rounded-full'>
              {badge}
            </span>
          )}
        </div>
      </button>
      {expandedSections[id] && <div className='pi-px-4 pi-pb-4'>{children}</div>}
    </div>
  )

  const filteredLogs = consoleLogs.filter(
    (log) => consoleFilter === 'all' || log.type === consoleFilter,
  )

  return (
    <div className='pi-min-h-screen pi-bg-gradient-to-br pi-from-gray-50 pi-to-gray-100 pi-p-6'>
      <div className='pi-max-w-[1800px] pi-mx-auto'>
        {/* Header */}
        <div className='pi-mb-6'>
          <h1 className='pi-text-3xl pi-font-bold pi-text-gray-900 pi-mb-2'>
            Phone Island Testing Suite
          </h1>
          <p className='pi-text-gray-600'>
            Comprehensive testing environment for PhoneIsland component
          </p>
        </div>

        {/* Token Input - Always visible */}
        <div className='pi-mb-6 pi-bg-white pi-rounded-lg pi-shadow-sm pi-border pi-border-gray-200 pi-p-4'>
          <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700 pi-mb-2'>
            🔑 Authentication Token
          </label>
          <div className='pi-flex pi-gap-2 pi-mb-3'>
            <input
              type='text'
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder='Insert authentication token'
              className='pi-flex-1 pi-px-4 pi-py-3 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500 focus:pi-border-emerald-500 pi-transition-all pi-font-mono pi-text-sm'
            />
            <Button
              variant='default'
              onClick={() => {
                if (token && tokenConfig[1]) {
                  const fileName = `interno_${tokenConfig[1]}_${tokenConfig[0]}.txt`
                  const element = document.createElement('a')
                  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(token))
                  element.setAttribute('download', fileName)
                  element.style.display = 'none'
                  document.body.appendChild(element)
                  element.click()
                  document.body.removeChild(element)
                  addLog('event', `📥 Token downloaded as ${fileName}`)
                }
              }}
              title='Download current token'
            >
              ⬇️
            </Button>
            <input
              ref={fileInputRef}
              type='file'
              accept='.txt'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    const content = event.target?.result as string
                    if (content) {
                      const trimmedToken = content.trim()
                      setToken(trimmedToken)
                      localStorage.setItem('phoneIslandToken', trimmedToken)
                      addLog('event', `📤 Token imported from ${file.name}`)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }
                  }
                  reader.readAsText(file)
                }
              }}
              style={{ display: 'none' }}
            />
            <Button
              variant='default'
              onClick={() => fileInputRef.current?.click()}
              title='Import token from file'
            >
              ⬆️
            </Button>
          </div>
          {tokenConfig[1] && (
            <div className='pi-mt-3 pi-flex pi-flex-wrap pi-gap-3 pi-text-sm pi-text-gray-600'>
              <span className='pi-flex pi-items-center pi-gap-1'>
                <strong>User:</strong> {tokenConfig[1]}
              </span>
              <span className='pi-flex pi-items-center pi-gap-1'>
                <strong>Ext:</strong> {tokenConfig[3]}
              </span>
              <span className='pi-flex pi-items-center pi-gap-1'>
                <strong>Host:</strong> {tokenConfig[0]}
              </span>
            </div>
          )}
        </div>

        {showUI && (
          <div className='pi-grid pi-grid-cols-1 lg:pi-grid-cols-2 pi-gap-6'>
            {/* Left Column */}
            <div className='pi-space-y-6'>
              {/* Call Controls */}
              <Section title='📞 Call Controls' id='call'>
                <div className='pi-space-y-4'>
                  <div className='pi-flex pi-gap-2'>
                    <input
                      type='text'
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder='Phone number'
                      className='pi-flex-1 pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500'
                    />
                    <Button
                      variant='green'
                      onClick={() => eventDispatch('phone-island-call-start', { number })}
                    >
                      <FontAwesomeIcon icon={faPhone} />
                    </Button>
                    <Button variant='red' onClick={() => eventDispatch('phone-island-call-end', {})}>
                      <FontAwesomeIcon icon={faPhone} />
                    </Button>
                  </div>

                  <div className='pi-grid pi-grid-cols-3 pi-gap-2'>
                    <Button variant='default' onClick={() => setShowKeyboards(!showKeyboards)}>
                      <FontAwesomeIcon icon={faGridRound} className='pi-mr-2' />
                      Keypad
                    </Button>
                    <Button
                      variant='default'
                      onClick={() => {
                        setIsSmallView(!isSmallView)
                        eventDispatch(
                          isSmallView ? 'phone-island-expand' : 'phone-island-compress',
                          {},
                        )
                      }}
                    >
                      <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} className='pi-mr-2' />
                      {isSmallView ? 'Expand' : 'Compress'}
                    </Button>
                    <Button
                      variant='default'
                      onClick={() => {
                        const newTheme = theme === 'dark' ? 'light' : 'dark'
                        setTheme(newTheme)
                        eventDispatch('phone-island-theme-change', { selectedTheme: newTheme })
                      }}
                    >
                      <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                    </Button>
                  </div>

                  {showKeyboards && (
                    <div className='pi-bg-gray-50 pi-rounded-lg pi-p-4'>
                      <div className='pi-grid pi-grid-cols-3 pi-gap-2'>
                        {dtmfKeys.flat().map((key) => (
                          <Button
                            variant='default'
                            key={key}
                            onClick={() =>
                              eventDispatch('phone-island-call-keypad-send', { key })
                            }
                            className='pi-py-3 pi-text-xl'
                          >
                            {key}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* Devices */}
              <Section title='🎧 Audio & Video Devices' id='devices'>
                <div className='pi-space-y-4'>
                  {/* Main Device */}
                  <div>
                    <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700 pi-mb-2'>
                      Main Device
                    </label>
                    <select
                      value={default_device?.id || ''}
                      onChange={async (e) => {
                        const device = noMobileListDevice.find((d) => d.id === e.target.value)
                        if (device) {
                          try {
                            const response = await setMainDevice({ id: device.id })
                            if (response) window.location.reload()
                          } catch (err) {
                            console.error(err)
                          }
                        }
                      }}
                      className='pi-w-full pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500'
                    >
                      {noMobileListDevice
                        .filter((d: any) => d.type !== 'nethlink')
                        .map((device: any) => (
                          <option key={device.id} value={device.id}>
                            {device.id === default_device?.id ? '✓ ' : ''}
                            {device.type === 'webrtc'
                              ? 'Web Phone'
                              : device.description || 'IP Phone'}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Microphone */}
                  <div>
                    <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700 pi-mb-2'>
                      Microphone
                    </label>
                    <select
                      value={selectedAudioInput?.deviceId || ''}
                      onChange={(e) => {
                        const device = audioInputs.find((d) => d.deviceId === e.target.value)
                        setSelectedAudioInput(device)
                        localStorage.setItem(
                          'phone-island-audio-input-device',
                          JSON.stringify({ deviceId: e.target.value }),
                        )
                        eventDispatch('phone-island-audio-input-change', {
                          deviceId: e.target.value,
                        })
                      }}
                      className='pi-w-full pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500'
                    >
                      <option value=''>Select microphone</option>
                      {audioInputs.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Speaker */}
                  <div>
                    <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700 pi-mb-2'>
                      Speaker
                    </label>
                    <select
                      value={selectedAudioOutput?.deviceId || ''}
                      onChange={(e) => {
                        const device = audioOutputs.find((d) => d.deviceId === e.target.value)
                        setSelectedAudioOutput(device)
                        localStorage.setItem(
                          'phone-island-audio-output-device',
                          JSON.stringify({ deviceId: e.target.value }),
                        )
                        eventDispatch('phone-island-audio-output-change', {
                          deviceId: e.target.value,
                        })
                      }}
                      className='pi-w-full pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500'
                    >
                      <option value=''>Select speaker</option>
                      {audioOutputs.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Speaker ${d.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Camera */}
                  <div>
                    <label className='pi-block pi-text-sm pi-font-medium pi-text-gray-700 pi-mb-2'>
                      Camera
                    </label>
                    <select
                      value={selectedVideoInput?.deviceId || ''}
                      onChange={(e) => {
                        const device = videoInputs.find((d) => d.deviceId === e.target.value)
                        setSelectedVideoInput(device)
                        localStorage.setItem(
                          'phone-island-video-input-device',
                          JSON.stringify({ deviceId: e.target.value }),
                        )
                        eventDispatch('phone-island-video-input-change', {
                          deviceId: e.target.value,
                        })
                      }}
                      className='pi-w-full pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500'
                    >
                      <option value=''>Select camera</option>
                      {videoInputs.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Section>

              {/* Events */}
              <Section title='⚡ Event Management' id='events'>
                <div className='pi-space-y-3'>
                  <div className='pi-flex pi-gap-2'>
                    <select
                      value={alert}
                      onChange={(e) => setAlert(e.target.value)}
                      className='pi-flex-1 pi-px-4 pi-py-2 pi-border pi-border-gray-300 pi-rounded-lg focus:pi-ring-2 focus:pi-ring-emerald-500'
                    >
                      {eventOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={!opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant='default'
                      onClick={() => {
                        eventDispatch('phone-island-alert', alert)
                        addLog('event', `Alert sent: ${alert}`)
                      }}
                      disabled={!alert}
                    >
                      Send
                    </Button>
                  </div>

                  <div className='pi-space-y-2'>
                    <p className='pi-text-xs pi-font-medium pi-text-gray-600 pi-mb-2'>
                      Param URL Type
                    </p>
                    {['ringing', 'answered', 'button', 'never'].map((type) => (
                      <label key={type} className='pi-flex pi-items-center pi-gap-2 pi-text-sm'>
                        <input
                          type='radio'
                          name='urlOpenType'
                          checked={urlOpenType === type}
                          onChange={async () => {
                            setUrlOpenType(type)
                            store.dispatch.paramUrl.setOpenParamUrlType(type)
                            try {
                              await setIncomingCallsPreference({ open_param_url: type })
                              setToastMessage(`URL preference: ${type}`)
                              setShowToast(true)
                            } catch (err) {
                              console.error(err)
                            }
                          }}
                          className='pi-text-emerald-600'
                        />
                        <span className='pi-capitalize'>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </Section>

              {/* Views & Audio */}
              <Section title='🎨 Views & Audio' id='views'>
                <div className='pi-space-y-3'>
                  <div className='pi-grid pi-grid-cols-3 pi-gap-2'>
                    <Button
                      variant='default'
                      onClick={() =>
                        eventDispatch('phone-island-view-changed', { viewType: 'call' })
                      }
                    >
                      <FontAwesomeIcon icon={faPhone} />
                    </Button>
                    <Button
                      variant='default'
                      onClick={() =>
                        eventDispatch('phone-island-view-changed', { viewType: 'settings' })
                      }
                    >
                      <FontAwesomeIcon icon={faGear} />
                    </Button>
                    <Button
                      variant='default'
                      onClick={() =>
                        eventDispatch('phone-island-view-changed', {
                          viewType: 'waitingConference',
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faUsers} />
                    </Button>
                  </div>
                  <div className='pi-grid pi-grid-cols-3 pi-gap-2'>
                    <Button
                      variant='default'
                      onClick={() => eventDispatch('phone-island-player-force-stop', {})}
                    >
                      <FontAwesomeIcon icon={faBullhorn} className='pi-mr-2' />
                      Stop Audio
                    </Button>
                    <Button
                      variant='default'
                      onClick={() =>
                        eventDispatch('phone-island-audio-player-start', {
                          type: 'announcement',
                          id: '4',
                        })
                      }
                    >
                      Play Test
                    </Button>
                    <Button
                      variant='default'
                      onClick={() => eventDispatch('phone-island-audio-input-switch-start', {})}
                    >
                      <FontAwesomeIcon icon={faVolumeHigh} className='pi-mr-2' />
                      Test Audio
                    </Button>
                  </div>
                </div>
              </Section>
            </div>

            {/* Right Column */}
            <div className='pi-space-y-6'>
              {/* Console */}
              <Section
                title='📟 Event Console'
                id='console'
                badge={`${filteredLogs.length} logs`}
              >
                <div className='pi-space-y-3'>
                  <div className='pi-flex pi-items-center pi-justify-between'>
                    <div className='pi-flex pi-gap-2'>
                      {(['all', 'event', 'info', 'error'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setConsoleFilter(filter)}
                          className={`pi-px-3 pi-py-1 pi-text-xs pi-rounded-full pi-transition-colors ${
                            consoleFilter === filter
                              ? 'pi-bg-emerald-600 pi-text-white'
                              : 'pi-bg-gray-200 pi-text-gray-700 hover:pi-bg-gray-300'
                          }`}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>
                    <Button variant='default' onClick={clearConsole} className='pi-text-xs'>
                      <FontAwesomeIcon icon={faTrash} className='pi-mr-1' />
                      Clear
                    </Button>
                  </div>

                  <div className='pi-bg-gray-900 pi-rounded-lg pi-p-3 pi-h-96 pi-overflow-y-auto pi-font-mono pi-text-xs'>
                    {filteredLogs.length === 0 ? (
                      <div className='pi-text-gray-500 pi-text-center pi-py-8'>
                        <FontAwesomeIcon icon={faTerminal} className='pi-text-2xl pi-mb-2' />
                        <p>No logs yet</p>
                      </div>
                    ) : (
                      filteredLogs.map((log) => (
                        <div
                          key={log.id}
                          className={`pi-py-1 pi-border-b pi-border-gray-800 ${
                            log.type === 'error'
                              ? 'pi-text-red-400'
                              : log.type === 'warning'
                              ? 'pi-text-yellow-400'
                              : log.type === 'event'
                              ? 'pi-text-emerald-400'
                              : 'pi-text-gray-300'
                          }`}
                        >
                          <span className='pi-text-gray-500'>[{log.timestamp}]</span>{' '}
                          <span className='pi-font-semibold pi-uppercase pi-text-xs'>
                            [{log.type}]
                          </span>{' '}
                          {log.message}
                        </div>
                      ))
                    )}
                    <div ref={consoleEndRef} />
                  </div>
                </div>
              </Section>

              {/* Debug Tools */}
              <Section title='🔧 Debug Tools' id='debug'>
                <div className='pi-grid pi-grid-cols-2 pi-gap-2'>
                  {[
                    { label: 'Call Status', event: 'phone-island-call-status' },
                    { label: 'User Status', event: 'phone-island-user-status' },
                    { label: 'All Users', event: 'phone-island-all-users-status' },
                    { label: 'Island Status', event: 'phone-island-status' },
                    { label: 'WebRTC Status', event: 'phone-island-webrtc-status' },
                    { label: 'Player Status', event: 'phone-island-player-status' },
                    { label: 'Conference', event: 'phone-island-conference-status' },
                    { label: 'Streaming', event: 'phone-island-streaming-status' },
                    { label: 'Download JSON', event: 'phone-island-stores-download' },
                    { label: 'Force Reload', event: 'phone-island-reload-component' },
                  ].map(({ label, event }) => (
                    <Button
                      key={event}
                      variant='default'
                      onClick={() =>
                        eventDispatch(
                          event as any,
                          event === 'phone-island-reload-component' ? { force: true } : {},
                        )
                      }
                      className='pi-text-xs'
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* PhoneIsland Component */}
        <div className='pi-mt-6'>
          <PhoneIsland
            dataConfig={token.toString()}
            showAlways={false}
            {...args}
            uaType={'desktop'}
            urlParamWithEvent
          />
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className='pi-fixed pi-bottom-6 pi-right-6 pi-z-50 pi-animate-fade-in-up'>
          <div className='pi-bg-emerald-100 pi-border-l-4 pi-border-emerald-500 pi-text-emerald-700 pi-p-4 pi-rounded-lg pi-shadow-lg pi-flex pi-items-center pi-gap-3 pi-min-w-[300px]'>
            <FontAwesomeIcon icon={faCheck} className='pi-text-emerald-600' />
            <span className='pi-flex-1'>{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className='pi-text-emerald-600 hover:pi-text-emerald-800'
            >
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
