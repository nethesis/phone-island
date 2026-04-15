import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Base64 } from 'js-base64'
import { PhoneIsland } from './App'
import { eventDispatch } from './utils/genericFunctions/eventDispatch'
import './index.css'

type DecodedConfig = {
  hostName: string
  username: string
  sipExten: string
  sipHost: string
  sipPort: string
}

type DeviceKind = 'audioinput' | 'audiooutput' | 'videoinput'
type ShellTheme = 'system' | 'light' | 'dark'
type WidgetTheme = 'system' | 'light' | 'dark'
type EventCategory = 'call' | 'ui' | 'devices' | 'media' | 'debug' | 'transcription' | 'network'

type DeviceOption = {
  deviceId: string
  kind: DeviceKind
  label: string
}

type RingtoneOption = {
  name: string
  displayName: string
  base64Audio: string
}

type EventFilterState = Record<EventCategory, boolean>

type EventLogEntry = {
  id: number
  name: string
  category: EventCategory
  direction: 'out' | 'in'
  timestamp: string
  detail: unknown
}

type TranscriptionEntry = {
  id: number
  speaker: string
  text: string
  isFinal: boolean
  timestamp: string
  uniqueId: string
}

const TOKEN_STORAGE_KEY = 'phoneIslandToken'
const NUMBER_STORAGE_KEY = 'phoneIslandDevNumber'
const WIDGET_THEME_STORAGE_KEY = 'phoneIslandDevTheme'
const SHELL_THEME_STORAGE_KEY = 'phoneIslandDevShellTheme'
const FILTERS_STORAGE_KEY = 'phoneIslandEventFilters'
const WIDGET_MODE_STORAGE_KEY = 'phoneIslandUrlOpenMode'
const TRANSCRIPTION_AUTOSCROLL_STORAGE_KEY = 'phoneIslandTranscriptionAutoScroll'

const DEVICE_STORAGE_KEYS: Record<DeviceKind, string> = {
  audioinput: 'phone-island-audio-input-device',
  audiooutput: 'phone-island-audio-output-device',
  videoinput: 'phone-island-video-input-device',
}

const DEFAULT_EVENT_FILTERS: EventFilterState = {
  call: true,
  ui: true,
  devices: true,
  media: true,
  debug: true,
  transcription: true,
  network: true,
}

const ALERT_OPTIONS = [
  'browser_permissions',
  'user_permissions',
  'unknown_media_permissions',
  'webrtc_down',
  'socket_down',
  'busy_camera',
  'call_transfered',
] as const

const VIEW_OPTIONS = [
  { value: 'call', label: 'Call' },
  { value: 'settings', label: 'Settings' },
  { value: 'keypad', label: 'Keypad' },
  { value: 'conference', label: 'Conference' },
  { value: 'operatorBusy', label: 'Operator busy' },
  { value: 'player', label: 'Player' },
  { value: 'recorder', label: 'Recorder' },
  { value: 'videoView', label: 'Video' },
] as const

const STATUS_ACTIONS = [
  { label: 'Call', eventName: 'phone-island-call-status' },
  { label: 'User', eventName: 'phone-island-user-status' },
  { label: 'All users', eventName: 'phone-island-all-users-status' },
  { label: 'Island', eventName: 'phone-island-status' },
  { label: 'WebRTC', eventName: 'phone-island-webrtc-status' },
  { label: 'Player', eventName: 'phone-island-player-status' },
  { label: 'Conference', eventName: 'phone-island-conference-status' },
  { label: 'Streaming', eventName: 'phone-island-streaming-status' },
  { label: 'Param URL', eventName: 'phone-island-paramurl-status' },
  { label: 'Queue', eventName: 'phone-island-queue-status' },
] as const

const OBSERVED_EVENTS = [
  'phone-island-call-start',
  'phone-island-call-end',
  'phone-island-call-started',
  'phone-island-call-ringing',
  'phone-island-call-answered',
  'phone-island-call-ended',
  'phone-island-call-status',
  'phone-island-view-changed',
  'phone-island-expand',
  'phone-island-expanded',
  'phone-island-compress',
  'phone-island-compressed',
  'phone-island-island-keyboard',
  'phone-island-reset-position',
  'phone-island-sideview-open',
  'phone-island-sideview-opened',
  'phone-island-sideview-close',
  'phone-island-sideview-closed',
  'phone-island-conference-list-open',
  'phone-island-conference-list-opened',
  'phone-island-conference-list-close',
  'phone-island-conference-list-closed',
  'phone-island-theme-change',
  'phone-island-theme-changed',
  'phone-island-alert',
  'phone-island-audio-input-change',
  'phone-island-audio-input-changed',
  'phone-island-audio-output-change',
  'phone-island-audio-output-changed',
  'phone-island-video-input-change',
  'phone-island-video-input-changed',
  'phone-island-ringing-tone-list',
  'phone-island-ringing-tone-list-response',
  'phone-island-ringing-tone-select',
  'phone-island-ringing-tone-selected',
  'phone-island-ringing-tone-output',
  'phone-island-ringing-tone-output-changed',
  'phone-island-audio-player-start',
  'phone-island-audio-player-started',
  'phone-island-audio-player-close',
  'phone-island-audio-player-closed',
  'phone-island-player-force-stop',
  'phone-island-recording-open',
  'phone-island-recording-opened',
  'phone-island-stores-download',
  'phone-island-stores-downloaded',
  'phone-island-transcription-open',
  'phone-island-transcription-opened',
  'phone-island-transcription-close',
  'phone-island-transcription-closed',
  'phone-island-transcription-toggle',
  'phone-island-start-transcription',
  'phone-island-stop-transcription',
  'phone-island-conversation-transcription',
  'phone-island-summary-call-check',
  'phone-island-summary-ready',
  'phone-island-summary-not-ready',
  'phone-island-call-summary-notify',
  'phone-island-summary-call-notified',
  'phone-island-check-connection',
  'phone-island-internet-connected',
  'phone-island-internet-disconnected',
  'phone-island-user-informations-update',
  'phone-island-main-presence',
  'phone-island-user-status',
  'phone-island-all-users-status',
  'phone-island-status',
  'phone-island-webrtc-status',
  'phone-island-player-status',
  'phone-island-conference-status',
  'phone-island-streaming-status',
  'phone-island-paramurl-status',
  'phone-island-queue-status',
  'phone-island-init-audio',
  'phone-island-emergency-stop-ringtone',
  'phone-island-emergency-stop-ringtone-completed',
] as const

const parseConfig = (token: string): DecodedConfig | null => {
  if (!token) {
    return null
  }

  try {
    const [hostName = '', username = '', , sipExten = '', , sipHost = '', sipPort = ''] = Base64.atob(
      token,
    ).split(':')

    return {
      hostName,
      username,
      sipExten,
      sipHost,
      sipPort,
    }
  } catch {
    return null
  }
}

const getStoredDeviceId = (kind: DeviceKind) => {
  try {
    const rawValue = localStorage.getItem(DEVICE_STORAGE_KEYS[kind])

    if (!rawValue) {
      return 'default'
    }

    return JSON.parse(rawValue)?.deviceId || 'default'
  } catch {
    return 'default'
  }
}

const getStoredFilters = (): EventFilterState => {
  try {
    const rawValue = localStorage.getItem(FILTERS_STORAGE_KEY)

    if (!rawValue) {
      return DEFAULT_EVENT_FILTERS
    }

    return {
      ...DEFAULT_EVENT_FILTERS,
      ...JSON.parse(rawValue),
    }
  } catch {
    return DEFAULT_EVENT_FILTERS
  }
}

const detectEventCategory = (name: string): EventCategory => {
  if (name.includes('transcription') || name.includes('summary')) {
    return 'transcription'
  }

  if (name.includes('audio-input') || name.includes('audio-output') || name.includes('video-input')) {
    return 'devices'
  }

  if (
    name.includes('audio-player') ||
    name.includes('ringing-tone') ||
    name.includes('recording') ||
    name.includes('player')
  ) {
    return 'media'
  }

  if (
    name.includes('internet') ||
    name.includes('socket') ||
    name.includes('webrtc') ||
    name.includes('presence') ||
    name.includes('queue')
  ) {
    return 'network'
  }

  if (
    name.includes('status') ||
    name.includes('stores') ||
    name.includes('alert') ||
    name.includes('user-informations')
  ) {
    return 'debug'
  }

  if (
    name.includes('view') ||
    name.includes('sideview') ||
    name.includes('conference-list') ||
    name.includes('expand') ||
    name.includes('compress') ||
    name.includes('keyboard') ||
    name.includes('reset-position') ||
    name.includes('theme')
  ) {
    return 'ui'
  }

  return 'call'
}

const formatEventDetail = (detail: unknown) => {
  if (detail === undefined) {
    return 'No payload'
  }

  if (typeof detail === 'string') {
    return detail
  }

  try {
    return JSON.stringify(detail, null, 2)
  } catch {
    return 'Unserializable payload'
  }
}

const getDeviceLabel = (device: MediaDeviceInfo, index: number) => {
  if (device.label) {
    return device.label
  }

  const fallbackIndex = index + 1

  if (device.kind === 'audioinput') {
    return `Microphone ${fallbackIndex}`
  }

  if (device.kind === 'audiooutput') {
    return `Speaker ${fallbackIndex}`
  }

  return `Camera ${fallbackIndex}`
}

const getShellThemeClasses = (resolvedTheme: 'light' | 'dark') => {
  if (resolvedTheme === 'light') {
    return {
      app: 'pi-bg-[radial-gradient(circle_at_top,#fff5d6,transparent_35%),linear-gradient(180deg,#fffaf0,#f5efe3_42%,#ebe0d0)] pi-text-stone-900',
      shellPanel: 'pi-border-stone-900/10 pi-bg-white/70 pi-text-stone-900 pi-shadow-[0_24px_80px_rgba(120,92,56,0.16)]',
      shellMuted: 'pi-text-stone-600',
      shellBorder: 'pi-border-stone-900/10',
      shellInput: 'pi-border-stone-900/10 pi-bg-white pi-text-stone-900 placeholder:pi-text-stone-400',
      stage: 'pi-border-stone-900/10 pi-bg-[radial-gradient(circle_at_top,#fff0bf,transparent_30%),linear-gradient(180deg,#fffaf0,#efe6d7)]',
      stageGrid: 'pi-opacity-40',
      secondaryButton: 'pi-border-stone-900/10 pi-bg-stone-900/[0.04] pi-text-stone-800 hover:pi-bg-stone-900/[0.08]',
      surface: 'pi-border-stone-900/10 pi-bg-stone-950/[0.03]',
      code: 'pi-bg-stone-950 pi-text-stone-100',
      badge: 'pi-bg-stone-900/6 pi-text-stone-700',
      accentButton: 'pi-bg-emerald-500 pi-text-white hover:pi-bg-emerald-600',
      destructiveButton: 'pi-bg-rose-500 pi-text-white hover:pi-bg-rose-600',
      activePill: 'pi-border-emerald-500/60 pi-bg-emerald-500/12 pi-text-emerald-700',
      inactivePill: 'pi-border-stone-900/10 pi-bg-white/60 pi-text-stone-700 hover:pi-bg-white',
    }
  }

  return {
    app: 'pi-bg-[radial-gradient(circle_at_top,#17312b,transparent_35%),linear-gradient(180deg,#050816,#090d1b_38%,#04030a)] pi-text-slate-100',
    shellPanel: 'pi-border-white/10 pi-bg-white/[0.06] pi-text-slate-100 pi-shadow-[0_24px_80px_rgba(0,0,0,0.45)]',
    shellMuted: 'pi-text-slate-300',
    shellBorder: 'pi-border-white/10',
    shellInput: 'pi-border-white/10 pi-bg-slate-950/80 pi-text-slate-100 placeholder:pi-text-slate-500',
    stage: 'pi-border-white/10 pi-bg-[radial-gradient(circle_at_top,#16233c,transparent_35%),linear-gradient(180deg,#0b1120,#05070f)]',
    stageGrid: 'pi-opacity-25',
    secondaryButton: 'pi-border-white/10 pi-bg-white/[0.05] pi-text-slate-200 hover:pi-bg-white/[0.1]',
    surface: 'pi-border-white/10 pi-bg-slate-950/55',
    code: 'pi-bg-[#050816] pi-text-slate-100',
    badge: 'pi-bg-white/[0.06] pi-text-slate-200',
    accentButton: 'pi-bg-emerald-500 pi-text-slate-950 hover:pi-bg-emerald-400',
    destructiveButton: 'pi-bg-rose-500 pi-text-white hover:pi-bg-rose-400',
    activePill: 'pi-border-emerald-400 pi-bg-emerald-400/15 pi-text-emerald-200',
    inactivePill: 'pi-border-white/10 pi-bg-white/[0.04] pi-text-slate-300 hover:pi-bg-white/[0.08]',
  }
}

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '')
  const [number, setNumber] = useState(() => localStorage.getItem(NUMBER_STORAGE_KEY) || '*43')
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme>(
    () => (localStorage.getItem(WIDGET_THEME_STORAGE_KEY) as WidgetTheme) || 'system',
  )
  const [shellTheme, setShellTheme] = useState<ShellTheme>(
    () => (localStorage.getItem(SHELL_THEME_STORAGE_KEY) as ShellTheme) || 'dark',
  )
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true,
  )
  const [eventFilters, setEventFilters] = useState<EventFilterState>(() => getStoredFilters())
  const [eventSearch, setEventSearch] = useState('')
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([])
  const [transcriptionLog, setTranscriptionLog] = useState<TranscriptionEntry[]>([])
  const [transcriptionAutoScroll, setTranscriptionAutoScroll] = useState(
    () => localStorage.getItem(TRANSCRIPTION_AUTOSCROLL_STORAGE_KEY) !== 'false',
  )
  const [mediaDevices, setMediaDevices] = useState<DeviceOption[]>([])
  const [selectedAudioInput, setSelectedAudioInput] = useState(() => getStoredDeviceId('audioinput'))
  const [selectedAudioOutput, setSelectedAudioOutput] = useState(() => getStoredDeviceId('audiooutput'))
  const [selectedVideoInput, setSelectedVideoInput] = useState(() => getStoredDeviceId('videoinput'))
  const [selectedRingtoneOutput, setSelectedRingtoneOutput] = useState(() => getStoredDeviceId('audiooutput'))
  const [ringtones, setRingtones] = useState<RingtoneOption[]>([])
  const [selectedRingtone, setSelectedRingtone] = useState('')
  const [alertType, setAlertType] = useState<(typeof ALERT_OPTIONS)[number]>('webrtc_down')
  const [transcriptionId, setTranscriptionId] = useState('')
  const [audioPreviewDescription, setAudioPreviewDescription] = useState('Dev ringtone preview')
  const [widgetOpenMode, setWidgetOpenMode] = useState(
    () => localStorage.getItem(WIDGET_MODE_STORAGE_KEY) || 'manual',
  )
  const logIdRef = useRef(0)
  const transcriptionIdRef = useRef(0)
  const transcriptionPanelRef = useRef<HTMLDivElement | null>(null)

  const decodedConfig = useMemo(() => parseConfig(token), [token])
  const resolvedShellTheme = shellTheme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : shellTheme
  const themeClasses = getShellThemeClasses(resolvedShellTheme)

  const normalizedRingtones = useMemo(
    () =>
      ringtones.map((ringtone, index) => ({
        ...ringtone,
        uniqueKey: `${ringtone.name}-${ringtone.displayName}-${index}`,
      })),
    [ringtones],
  )

  const audioInputDevices = useMemo(
    () => mediaDevices.filter((device) => device.kind === 'audioinput'),
    [mediaDevices],
  )
  const audioOutputDevices = useMemo(
    () => mediaDevices.filter((device) => device.kind === 'audiooutput'),
    [mediaDevices],
  )
  const videoInputDevices = useMemo(
    () => mediaDevices.filter((device) => device.kind === 'videoinput'),
    [mediaDevices],
  )

  const filteredEventLog = useMemo(() => {
    const normalizedSearch = eventSearch.trim().toLowerCase()

    return eventLog.filter((entry) => {
      if (!eventFilters[entry.category]) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return `${entry.name}\n${formatEventDetail(entry.detail)}`.toLowerCase().includes(normalizedSearch)
    })
  }, [eventFilters, eventLog, eventSearch])

  const addEventLog = (name: string, detail: unknown, direction: 'out' | 'in') => {
    logIdRef.current += 1
    const category = detectEventCategory(name)

    setEventLog((currentLog) => [
      {
        id: logIdRef.current,
        name,
        category,
        direction,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        detail,
      },
      ...currentLog,
    ].slice(0, 250))
  }

  const dispatchTrackedEvent = (name: string, detail: unknown = {}) => {
    addEventLog(name, detail, 'out')
    eventDispatch(name, detail)
  }

  useEffect(() => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }, [token])

  useEffect(() => {
    localStorage.setItem(NUMBER_STORAGE_KEY, number)
  }, [number])

  useEffect(() => {
    localStorage.setItem(WIDGET_THEME_STORAGE_KEY, widgetTheme)
    dispatchTrackedEvent('phone-island-theme-change', { selectedTheme: widgetTheme })
  }, [widgetTheme])

  useEffect(() => {
    localStorage.setItem(SHELL_THEME_STORAGE_KEY, shellTheme)
  }, [shellTheme])

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(eventFilters))
  }, [eventFilters])

  useEffect(() => {
    localStorage.setItem(WIDGET_MODE_STORAGE_KEY, widgetOpenMode)
  }, [widgetOpenMode])

  useEffect(() => {
    localStorage.setItem(TRANSCRIPTION_AUTOSCROLL_STORAGE_KEY, String(transcriptionAutoScroll))
  }, [transcriptionAutoScroll])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updatePreference = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches)

    setSystemPrefersDark(mediaQuery.matches)
    mediaQuery.addEventListener('change', updatePreference)

    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    const syncMediaDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()

        setMediaDevices(
          devices
            .filter(
              (device): device is MediaDeviceInfo & { kind: DeviceKind } =>
                device.kind === 'audioinput' ||
                device.kind === 'audiooutput' ||
                device.kind === 'videoinput',
            )
            .map((device, index) => ({
              deviceId: device.deviceId || 'default',
              kind: device.kind,
              label: getDeviceLabel(device, index),
            })),
        )
      } catch (error) {
        addEventLog('phone-island-device-enumeration-failed', { message: String(error) }, 'in')
      }
    }

    syncMediaDevices()
    navigator.mediaDevices?.addEventListener?.('devicechange', syncMediaDevices)

    return () => navigator.mediaDevices?.removeEventListener?.('devicechange', syncMediaDevices)
  }, [])

  useEffect(() => {
    const handleObservedEvent = (event: Event) => {
      const customEvent = event as CustomEvent
      const eventName = customEvent.type
      const detail = customEvent.detail

      addEventLog(eventName, detail, 'in')

      if (eventName === 'phone-island-ringing-tone-list-response') {
        setRingtones(detail?.ringtones || [])
      }

      if (eventName === 'phone-island-ringing-tone-selected' && detail?.name) {
        setSelectedRingtone(detail.name)
      }

      if (eventName === 'phone-island-ringing-tone-output-changed' && detail?.deviceId) {
        setSelectedRingtoneOutput(detail.deviceId)
      }

      if (eventName === 'phone-island-conversation-transcription') {
        transcriptionIdRef.current += 1
        setTranscriptionLog((currentLog) => [
          ...currentLog,
          {
            id: transcriptionIdRef.current,
            speaker: detail?.speaker_name || 'Speaker',
            text: detail?.transcription || '',
            isFinal: Boolean(detail?.is_final),
            timestamp: new Date().toLocaleTimeString('en-GB'),
            uniqueId: detail?.uniqueid || detail?.linkedid || '-',
          },
        ].slice(-200))
      }
    }

    OBSERVED_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleObservedEvent as EventListener)
    })

    return () => {
      OBSERVED_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleObservedEvent as EventListener)
      })
    }
  }, [])

  useEffect(() => {
    if (transcriptionAutoScroll && transcriptionPanelRef.current) {
      transcriptionPanelRef.current.scrollTop = transcriptionPanelRef.current.scrollHeight
    }
  }, [transcriptionAutoScroll, transcriptionLog])

  useEffect(() => {
    if (decodedConfig) {
      dispatchTrackedEvent('phone-island-ringing-tone-list', {})
    }
  }, [decodedConfig])

  const handleDeviceChange = (kind: DeviceKind, deviceId: string) => {
    const payload = { deviceId }

    if (kind === 'audioinput') {
      setSelectedAudioInput(deviceId)
      dispatchTrackedEvent('phone-island-audio-input-change', payload)
      return
    }

    if (kind === 'audiooutput') {
      setSelectedAudioOutput(deviceId)
      dispatchTrackedEvent('phone-island-audio-output-change', payload)
      return
    }

    setSelectedVideoInput(deviceId)
    dispatchTrackedEvent('phone-island-video-input-change', payload)
  }

  const handleRingtonePreview = () => {
    const ringtone = ringtones.find((item) => item.name === selectedRingtone)

    if (!ringtone) {
      return
    }

    dispatchTrackedEvent('phone-island-audio-player-start', {
      type: 'ringtone_preview',
      base64_audio_file: ringtone.base64Audio,
      description: audioPreviewDescription,
    })
  }

  const renderSectionTitle = (eyebrow: string, title: string, description: string) => (
    <div className='pi-space-y-1'>
      <p className='pi-text-[11px] pi-uppercase pi-tracking-[0.28em] pi-text-emerald-400'>{eyebrow}</p>
      <div className='pi-space-y-1'>
        <h2 className='pi-text-lg pi-font-semibold'>{title}</h2>
        <p className={`pi-text-sm pi-leading-6 ${themeClasses.shellMuted}`}>{description}</p>
      </div>
    </div>
  )

  return (
    <div className={`pi-min-h-screen ${themeClasses.app}`}>
      <div className='pi-pointer-events-none pi-fixed pi-inset-0 pi-z-[40]'>
        <div className='pi-relative pi-h-full pi-w-full'>
          {decodedConfig ? <PhoneIsland dataConfig={token} showAlways={false} uaType='desktop' /> : null}
        </div>
      </div>
      <div className='pi-relative pi-isolate pi-min-h-screen pi-overflow-hidden'>
        <div className='pi-pointer-events-none pi-absolute pi-inset-x-0 pi-top-0 pi-h-80 pi-bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_55%)]' />
        <div className='pi-mx-auto pi-flex pi-max-w-[1680px] pi-flex-col pi-gap-6 pi-px-4 pi-py-5 lg:pi-px-6 xl:pi-px-8'>
          <header
            className={`pi-flex pi-flex-col pi-gap-4 pi-rounded-[28px] pi-border pi-p-5 lg:pi-flex-row lg:pi-items-center lg:pi-justify-between ${themeClasses.shellPanel}`}
          >
            <div className='pi-max-w-3xl pi-space-y-2'>
              <p className='pi-text-[11px] pi-uppercase pi-tracking-[0.35em] pi-text-emerald-400'>Phone Island Dev Console</p>
              <h1 className='pi-text-2xl pi-font-semibold lg:pi-text-3xl'>Live reload with the full debug console</h1>
              <p className={`pi-max-w-2xl pi-text-sm pi-leading-6 ${themeClasses.shellMuted}`}>
                This dev shell stays isolated from the runtime widget. It restores the old debug controls,
                listens to CustomEvent traffic, and keeps the Parcel workflow intact.
              </p>
            </div>

            <div className='pi-flex pi-flex-col pi-gap-3 lg:pi-items-end'>
              <div className='pi-flex pi-flex-wrap pi-gap-2'>
                {(['system', 'light', 'dark'] as const).map((option) => (
                  <button
                    key={option}
                    type='button'
                    onClick={() => setShellTheme(option)}
                    className={`pi-rounded-full pi-border pi-px-4 pi-py-2 pi-text-sm pi-font-medium pi-transition ${
                      shellTheme === option ? themeClasses.activePill : themeClasses.inactivePill
                    }`}
                  >
                    Shell {option}
                  </button>
                ))}
              </div>
              <div className={`pi-inline-flex pi-items-center pi-gap-2 pi-rounded-full pi-border pi-px-3 pi-py-2 pi-text-xs ${themeClasses.badge} ${themeClasses.shellBorder}`}>
                <span className='pi-inline-flex pi-h-2 pi-w-2 pi-rounded-full pi-bg-emerald-400' />
                Host theme resolved: {resolvedShellTheme}
              </div>
            </div>
          </header>

          <div className='pi-grid pi-gap-6 2xl:pi-grid-cols-[420px_minmax(540px,1fr)_420px]'>
            <aside className='pi-flex pi-flex-col pi-gap-4'>
              <section className={`pi-rounded-[28px] pi-border pi-p-5 ${themeClasses.shellPanel}`}>
                {renderSectionTitle(
                  'Configuration',
                  'Config and themes',
                  'Base64 token, widget theme, and shell presentation settings.',
                )}

                <div className='pi-mt-5 pi-space-y-4'>
                  <label className='pi-block pi-space-y-2'>
                    <span className='pi-text-sm pi-font-medium'>Config token</span>
                    <textarea
                      value={token}
                      onChange={(event) => setToken(event.target.value.trim())}
                      placeholder='Base64 of HOST_NAME:USERNAME:AUTH_TOKEN:SIP_EXTEN:SIP_SECRET:SIP_HOST:SIP_PORT'
                      className={`pi-h-36 pi-w-full pi-rounded-3xl pi-border pi-p-4 pi-font-mono pi-text-xs pi-leading-6 focus:pi-outline-none ${themeClasses.shellInput}`}
                    />
                  </label>

                  <label className='pi-block pi-space-y-2'>
                    <span className='pi-text-sm pi-font-medium'>Quick number</span>
                    <input
                      value={number}
                      onChange={(event) => setNumber(event.target.value)}
                      className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                    />
                  </label>

                  <div className='pi-space-y-2'>
                    <span className='pi-text-sm pi-font-medium'>Widget theme</span>
                    <div className='pi-grid pi-grid-cols-3 pi-gap-2'>
                      {(['system', 'light', 'dark'] as const).map((option) => (
                        <button
                          key={option}
                          type='button'
                          onClick={() => setWidgetTheme(option)}
                          className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm pi-transition ${
                            widgetTheme === option ? themeClasses.activePill : themeClasses.inactivePill
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='pi-space-y-2'>
                    <span className='pi-text-sm pi-font-medium'>URL trigger preset</span>
                    <div className='pi-grid pi-grid-cols-2 pi-gap-2'>
                      {[
                        { value: 'ringing', label: 'When ringing' },
                        { value: 'answered', label: 'When answered' },
                        { value: 'button', label: 'When button clicked' },
                        { value: 'manual', label: 'Never' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type='button'
                          onClick={() => setWidgetOpenMode(option.value)}
                          className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm pi-transition ${
                            widgetOpenMode === option.value
                              ? themeClasses.activePill
                              : themeClasses.inactivePill
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className={`pi-rounded-[28px] pi-border pi-p-5 ${themeClasses.shellPanel}`}>
                {renderSectionTitle('Call Flow', 'Quick actions', 'The core controls from the old story used for day-to-day debugging.')}

                <div className='pi-mt-5 pi-grid pi-grid-cols-2 pi-gap-3'>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-call-start', { number })}
                    className={`pi-rounded-2xl pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.accentButton}`}
                  >
                    Start call
                  </button>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-call-end', {})}
                    className={`pi-rounded-2xl pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.destructiveButton}`}
                  >
                    End call
                  </button>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-island-keyboard', {})}
                    className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.secondaryButton}`}
                  >
                    Open keypad
                  </button>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-reset-position', {})}
                    className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.secondaryButton}`}
                  >
                    Reset position
                  </button>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-expand', {})}
                    className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.secondaryButton}`}
                  >
                    Expand
                  </button>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-compress', {})}
                    className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.secondaryButton}`}
                  >
                    Compress
                  </button>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-sideview-open', {})}
                    className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.secondaryButton}`}
                  >
                    Open sideview
                  </button>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-sideview-close', {})}
                    className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.secondaryButton}`}
                  >
                    Close sideview
                  </button>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-conference-list-open', {})}
                    className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.secondaryButton}`}
                  >
                    Open conf list
                  </button>
                  <button
                    type='button'
                    onClick={() => dispatchTrackedEvent('phone-island-conference-list-close', {})}
                    className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm pi-font-medium ${themeClasses.secondaryButton}`}
                  >
                    Close conf list
                  </button>
                </div>
              </section>

              <section className={`pi-rounded-[28px] pi-border pi-p-5 ${themeClasses.shellPanel}`}>
                {renderSectionTitle('Views', 'Routing and panels', 'View switching, transcription, and supporting actions used during debugging.')}

                <div className='pi-mt-5 pi-space-y-4'>
                  <div className='pi-grid pi-grid-cols-2 pi-gap-2'>
                    {VIEW_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => dispatchTrackedEvent('phone-island-view-changed', { viewType: option.value })}
                        className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <label className='pi-block pi-space-y-2'>
                    <span className='pi-text-sm pi-font-medium'>Transcription unique id</span>
                    <input
                      value={transcriptionId}
                      onChange={(event) => setTranscriptionId(event.target.value)}
                      placeholder='linkedid or uniqueid'
                      className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                    />
                  </label>

                  <div className='pi-grid pi-grid-cols-2 pi-gap-2'>
                    <button
                      type='button'
                      onClick={() =>
                        dispatchTrackedEvent('phone-island-transcription-open', {
                          linkedid: transcriptionId,
                          uniqueid: transcriptionId,
                        })
                      }
                      className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                    >
                      Open transcription
                    </button>
                    <button
                      type='button'
                      onClick={() => dispatchTrackedEvent('phone-island-transcription-close', {})}
                      className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                    >
                      Close transcription
                    </button>
                    <button
                      type='button'
                      onClick={() => dispatchTrackedEvent('phone-island-transcription-toggle', {})}
                      className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                    >
                      Toggle transcription
                    </button>
                    <button
                      type='button'
                      onClick={() => dispatchTrackedEvent('phone-island-summary-call-check', { linkedid: transcriptionId })}
                      className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                    >
                      Check summary
                    </button>
                    <button
                      type='button'
                      onClick={() => dispatchTrackedEvent('phone-island-call-summary-notify', { linkedid: transcriptionId })}
                      className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                    >
                      Watch summary
                    </button>
                    <button
                      type='button'
                      onClick={() => dispatchTrackedEvent('phone-island-check-connection', {})}
                      className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                    >
                      Check connection
                    </button>
                  </div>
                </div>
              </section>

              <section className={`pi-rounded-[28px] pi-border pi-p-5 ${themeClasses.shellPanel}`}>
                {renderSectionTitle('Devices', 'Inputs and outputs', 'Select devices directly from the dev shell with local persistence.')}

                <div className='pi-mt-5 pi-space-y-4'>
                  <label className='pi-block pi-space-y-2'>
                    <span className='pi-text-sm pi-font-medium'>Audio input</span>
                    <select
                      value={selectedAudioInput}
                      onChange={(event) => handleDeviceChange('audioinput', event.target.value)}
                      className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                    >
                      <option value='default'>Default microphone</option>
                      {audioInputDevices.map((device, index) => (
                        <option key={`${device.kind}-${device.deviceId}-${index}`} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className='pi-block pi-space-y-2'>
                    <span className='pi-text-sm pi-font-medium'>Audio output</span>
                    <select
                      value={selectedAudioOutput}
                      onChange={(event) => handleDeviceChange('audiooutput', event.target.value)}
                      className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                    >
                      <option value='default'>Default speaker</option>
                      {audioOutputDevices.map((device, index) => (
                        <option key={`${device.kind}-${device.deviceId}-${index}`} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className='pi-block pi-space-y-2'>
                    <span className='pi-text-sm pi-font-medium'>Video input</span>
                    <select
                      value={selectedVideoInput}
                      onChange={(event) => handleDeviceChange('videoinput', event.target.value)}
                      className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                    >
                      <option value='default'>Default camera</option>
                      {videoInputDevices.map((device, index) => (
                        <option key={`${device.kind}-${device.deviceId}-${index}`} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
            </aside>

            <main className='pi-flex pi-flex-col pi-gap-4'>
              <section className={`pi-relative pi-rounded-[32px] pi-border pi-p-5 lg:pi-p-6 ${themeClasses.stage}`}>
                <div className={`pi-pointer-events-none pi-absolute pi-inset-0 pi-bg-[linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] pi-bg-[size:30px_30px] ${themeClasses.stageGrid}`} />
                <div className='pi-relative pi-flex pi-flex-col pi-gap-4'>
                  <div className='pi-flex pi-flex-col pi-gap-3 lg:pi-flex-row lg:pi-items-center lg:pi-justify-between'>
                    <div className='pi-space-y-1'>
                      <p className='pi-text-[11px] pi-uppercase pi-tracking-[0.28em] pi-text-emerald-400'>Widget layer</p>
                      <h2 className='pi-text-xl pi-font-semibold'>Full-page drag surface</h2>
                      <p className={`pi-max-w-2xl pi-text-sm pi-leading-6 ${themeClasses.shellMuted}`}>
                        The widget now mounts in a fullscreen overlay, so dragging is no longer limited to the stage card.
                      </p>
                    </div>

                    <div className='pi-flex pi-flex-wrap pi-gap-2'>
                      <button
                        type='button'
                        onClick={() => dispatchTrackedEvent('phone-island-init-audio', {})}
                        className={`pi-rounded-full pi-border pi-px-4 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                      >
                        Init audio
                      </button>
                      <button
                        type='button'
                        onClick={() => dispatchTrackedEvent('phone-island-recording-open', {})}
                        className={`pi-rounded-full pi-border pi-px-4 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                      >
                        Open recorder
                      </button>
                      <button
                        type='button'
                        onClick={() => dispatchTrackedEvent('phone-island-stores-download', {})}
                        className={`pi-rounded-full pi-border pi-px-4 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                      >
                        Download stores
                      </button>
                    </div>
                  </div>

                  <div className='pi-relative pi-flex pi-min-h-[52vh] pi-items-center pi-justify-center pi-rounded-[28px] pi-border pi-border-white/10 pi-bg-black/10 pi-p-6'>
                    <div className='pi-absolute pi-inset-x-0 pi-top-0 pi-h-32 pi-bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.2),transparent_70%)]' />
                    <div className='pi-relative pi-z-10 pi-flex pi-max-w-lg pi-flex-col pi-items-center pi-gap-3 pi-text-center'>
                      <p className='pi-text-lg pi-font-medium'>Debug shell ready</p>
                      <p className={`pi-text-sm pi-leading-6 ${themeClasses.shellMuted}`}>
                        The widget is mounted on a fullscreen overlay above this page. Use the controls around it and drag the island anywhere in the viewport.
                      </p>
                    </div>
                  </div>

                  <div className='pi-grid pi-gap-4 lg:pi-grid-cols-[minmax(0,1fr)_280px]'>
                    <div className={`pi-rounded-[28px] pi-border pi-p-5 ${themeClasses.shellPanel}`}>
                      {renderSectionTitle('Media & Ringtone', 'Audio tools', 'Ringtone selection, preview, alert injection, recorder, and player helpers.')}

                      <div className='pi-mt-5 pi-grid pi-gap-4 lg:pi-grid-cols-2'>
                        <div className={`pi-rounded-3xl pi-border pi-p-4 ${themeClasses.surface}`}>
                          <div className='pi-flex pi-items-center pi-justify-between'>
                            <h3 className='pi-text-sm pi-font-semibold'>Ringtone controls</h3>
                            <button
                              type='button'
                              onClick={() => dispatchTrackedEvent('phone-island-ringing-tone-list', {})}
                              className={`pi-rounded-full pi-border pi-px-3 pi-py-2 pi-text-xs ${themeClasses.secondaryButton}`}
                            >
                              Refresh list
                            </button>
                          </div>
                          <div className='pi-mt-3 pi-space-y-3'>
                            <select
                              value={selectedRingtone}
                              onChange={(event) => {
                                const name = event.target.value
                                setSelectedRingtone(name)
                                dispatchTrackedEvent('phone-island-ringing-tone-select', { name })
                              }}
                              className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                            >
                              <option value=''>Select ringtone</option>
                              {normalizedRingtones.map((ringtone) => (
                                <option key={ringtone.uniqueKey} value={ringtone.name}>
                                  {ringtone.displayName}
                                </option>
                              ))}
                            </select>

                            <select
                              value={selectedRingtoneOutput}
                              onChange={(event) => {
                                const deviceId = event.target.value
                                setSelectedRingtoneOutput(deviceId)
                                dispatchTrackedEvent('phone-island-ringing-tone-output', { deviceId })
                              }}
                              className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                            >
                              <option value='default'>Default ringtone output</option>
                              {audioOutputDevices.map((device, index) => (
                                <option key={`${device.kind}-${device.deviceId}-${index}`} value={device.deviceId}>
                                  {device.label}
                                </option>
                              ))}
                            </select>

                            <label className='pi-block pi-space-y-2'>
                              <span className='pi-text-sm pi-font-medium'>Preview label</span>
                              <input
                                value={audioPreviewDescription}
                                onChange={(event) => setAudioPreviewDescription(event.target.value)}
                                className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                              />
                            </label>

                            <div className='pi-grid pi-grid-cols-2 pi-gap-2'>
                              <button
                                type='button'
                                onClick={handleRingtonePreview}
                                className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm ${themeClasses.secondaryButton}`}
                              >
                                Preview ringtone
                              </button>
                              <button
                                type='button'
                                onClick={() => dispatchTrackedEvent('phone-island-emergency-stop-ringtone', {})}
                                className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm ${themeClasses.secondaryButton}`}
                              >
                                Stop ringtone
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className={`pi-rounded-3xl pi-border pi-p-4 ${themeClasses.surface}`}>
                          <div className='pi-flex pi-items-center pi-justify-between'>
                            <h3 className='pi-text-sm pi-font-semibold'>Recorder and alerts</h3>
                          </div>
                          <div className='pi-mt-3 pi-space-y-3'>
                            <select
                              value={alertType}
                              onChange={(event) => setAlertType(event.target.value as (typeof ALERT_OPTIONS)[number])}
                              className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                            >
                              {ALERT_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <button
                              type='button'
                              onClick={() => dispatchTrackedEvent('phone-island-alert', alertType)}
                              className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm ${themeClasses.secondaryButton}`}
                            >
                              Send alert
                            </button>
                            <div className='pi-grid pi-grid-cols-2 pi-gap-2'>
                              <button
                                type='button'
                                onClick={() => dispatchTrackedEvent('phone-island-recording-open', {})}
                                className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm ${themeClasses.secondaryButton}`}
                              >
                                Open recording view
                              </button>
                              <button
                                type='button'
                                onClick={() => dispatchTrackedEvent('phone-island-audio-player-close', {})}
                                className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm ${themeClasses.secondaryButton}`}
                              >
                                Close player
                              </button>
                              <button
                                type='button'
                                onClick={() => dispatchTrackedEvent('phone-island-player-force-stop', {})}
                                className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm ${themeClasses.secondaryButton}`}
                              >
                                Force stop player
                              </button>
                              <button
                                type='button'
                                onClick={() => dispatchTrackedEvent('phone-island-init-audio', {})}
                                className={`pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm ${themeClasses.secondaryButton}`}
                              >
                                Warm audio path
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`pi-rounded-[28px] pi-border pi-p-5 ${themeClasses.shellPanel}`}>
                      {renderSectionTitle('Runtime', 'Current host state', 'Quick runtime values in plain text without the old summary card layout.')}
                      <div className={`pi-mt-5 pi-rounded-3xl pi-border pi-p-4 ${themeClasses.code}`}>
                        <pre className='pi-whitespace-pre-wrap pi-break-all pi-font-mono pi-text-[11px] pi-leading-6'>
{`token: ${decodedConfig ? 'loaded' : 'missing'}
host: ${decodedConfig?.hostName || '-'}
username: ${decodedConfig?.username || '-'}
sipExten: ${decodedConfig?.sipExten || '-'}
sipHost: ${decodedConfig?.sipHost || '-'}
sipPort: ${decodedConfig?.sipPort || '-'}
audioInput: ${selectedAudioInput}
audioOutput: ${selectedAudioOutput}
videoInput: ${selectedVideoInput}
ringtoneOutput: ${selectedRingtoneOutput}
devices: ${mediaDevices.length}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>

            <aside className='pi-flex pi-flex-col pi-gap-4'>
              <section className={`pi-rounded-[28px] pi-border pi-p-5 ${themeClasses.shellPanel}`}>
                {renderSectionTitle('Debug Status', 'State inspection', 'Buttons that trigger the same runtime state dumps you used in the old story.')}

                <div className='pi-mt-5 pi-grid pi-grid-cols-2 pi-gap-2'>
                  {STATUS_ACTIONS.map((action) => (
                    <button
                      key={action.eventName}
                      type='button'
                      onClick={() => dispatchTrackedEvent(action.eventName, {})}
                      className={`pi-rounded-2xl pi-border pi-px-3 pi-py-2 pi-text-sm ${themeClasses.secondaryButton}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className={`pi-rounded-[28px] pi-border pi-p-5 ${themeClasses.shellPanel}`}>
                {renderSectionTitle('Event Console', 'Raw console', 'A plain event console with filters, search, and direct payload output.')}

                <div className='pi-mt-5 pi-space-y-4'>
                  <input
                    value={eventSearch}
                    onChange={(event) => setEventSearch(event.target.value)}
                    placeholder='Search by event name or payload'
                    className={`pi-w-full pi-rounded-2xl pi-border pi-px-4 pi-py-3 pi-text-sm focus:pi-outline-none ${themeClasses.shellInput}`}
                  />

                  <div className='pi-flex pi-flex-wrap pi-gap-2'>
                    {(Object.keys(DEFAULT_EVENT_FILTERS) as EventCategory[]).map((category) => (
                      <button
                        key={category}
                        type='button'
                        onClick={() =>
                          setEventFilters((currentFilters) => ({
                            ...currentFilters,
                            [category]: !currentFilters[category],
                          }))
                        }
                        className={`pi-rounded-full pi-border pi-px-3 pi-py-2 pi-text-xs pi-font-medium pi-transition ${
                          eventFilters[category] ? themeClasses.activePill : themeClasses.inactivePill
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className='pi-flex pi-items-center pi-justify-between'>
                    <span className={`pi-text-xs ${themeClasses.shellMuted}`}>{filteredEventLog.length} visible events</span>
                    <button
                      type='button'
                      onClick={() => setEventLog([])}
                      className={`pi-rounded-full pi-border pi-px-3 pi-py-2 pi-text-xs ${themeClasses.secondaryButton}`}
                    >
                      Clear log
                    </button>
                  </div>

                  <div className={`pi-h-[420px] pi-overflow-auto pi-rounded-3xl pi-border pi-p-3 ${themeClasses.code}`}>
                    {filteredEventLog.length === 0 ? (
                      <p className='pi-p-3 pi-font-mono pi-text-sm pi-text-slate-400'>No events match the active filters.</p>
                    ) : (
                      <pre className='pi-whitespace-pre-wrap pi-break-all pi-font-mono pi-text-[11px] pi-leading-6 pi-text-slate-200'>
                        {filteredEventLog
                          .map(
                            (entry) =>
                              `[${entry.timestamp}] ${entry.direction.toUpperCase()} ${entry.name}${
                                entry.detail === undefined ? '' : ` ${formatEventDetail(entry.detail)}`
                              }`,
                          )
                          .join('\n\n')}
                      </pre>
                    )}
                  </div>
                </div>
              </section>

              <section className={`pi-rounded-[28px] pi-border pi-p-5 ${themeClasses.shellPanel}`}>
                {renderSectionTitle('Transcription', 'Satellite stream', 'Separate panel for transcription messages dispatched by the socket layer.')}

                <div className='pi-mt-5 pi-space-y-4'>
                  <div className='pi-flex pi-items-center pi-justify-between'>
                    <label className='pi-inline-flex pi-items-center pi-gap-2 pi-text-sm'>
                      <input
                        type='checkbox'
                        checked={transcriptionAutoScroll}
                        onChange={(event) => setTranscriptionAutoScroll(event.target.checked)}
                      />
                      Auto scroll
                    </label>

                    <button
                      type='button'
                      onClick={() => setTranscriptionLog([])}
                      className={`pi-rounded-full pi-border pi-px-3 pi-py-2 pi-text-xs ${themeClasses.secondaryButton}`}
                    >
                      Clear transcription
                    </button>
                  </div>

                  <div
                    ref={transcriptionPanelRef}
                    className={`pi-h-[280px] pi-overflow-auto pi-rounded-3xl pi-border pi-p-3 ${themeClasses.surface}`}
                  >
                    <div className='pi-space-y-3'>
                      {transcriptionLog.length === 0 ? (
                        <p className={`pi-p-3 pi-text-sm ${themeClasses.shellMuted}`}>
                          No transcription messages received.
                        </p>
                      ) : (
                        transcriptionLog.map((entry) => (
                          <article key={entry.id} className={`pi-rounded-2xl pi-border pi-p-3 ${themeClasses.surface}`}>
                            <div className='pi-flex pi-items-center pi-justify-between pi-gap-3'>
                              <div>
                                <p className='pi-text-sm pi-font-semibold'>{entry.speaker}</p>
                                <p className={`pi-text-xs ${themeClasses.shellMuted}`}>{entry.uniqueId}</p>
                              </div>
                              <div className='pi-flex pi-items-center pi-gap-2'>
                                <span className={`pi-rounded-full pi-px-2 pi-py-1 pi-text-[10px] ${entry.isFinal ? 'pi-bg-emerald-500/15 pi-text-emerald-300' : 'pi-bg-amber-500/15 pi-text-amber-300'}`}>
                                  {entry.isFinal ? 'final' : 'partial'}
                                </span>
                                <span className={`pi-text-[10px] ${themeClasses.shellMuted}`}>{entry.timestamp}</span>
                              </div>
                            </div>
                            <p className='pi-mt-2 pi-text-sm pi-leading-6'>{entry.text || '...'}</p>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

const container = document.getElementById('dev-root')

if (!container) {
  throw new Error('Missing dev root container')
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)