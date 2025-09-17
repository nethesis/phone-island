import React, { type FC, useState, useEffect } from 'react'
import { Events, Socket, WebRTC, Island, RestAPI } from './components'
import { Provider } from 'react-redux'
import { store } from './store'
import { Base64 } from 'js-base64'
import wakeUpWorker from './workers/wake_up'
import { initI18n } from './lib/i18n'

import 'react-tooltip/dist/react-tooltip.css'
import { useEventListener, eventDispatch, setJSONItem, getJSONItem } from './utils'
import { detach } from './lib/webrtc/messages'
import { checkDarkTheme, setTheme } from './lib/darkTheme'
import { changeOperatorStatus } from './services/user'
import { getParamUrl } from './services/user'
import { isEmpty } from './utils/genericFunctions/isEmpty'
import { checkInternetConnection } from './utils/genericFunctions/checkConnection'
import { isBackCallActive } from './utils/genericFunctions/isBackCallVisible'
import { isFromTrunk } from './lib/user/extensions'

interface PhoneIslandProps {
  dataConfig: string
  showAlways?: boolean
  uaType: string
}

interface DeviceInputOutputTypes {
  deviceId: string
}

export const PhoneIsland: FC<PhoneIslandProps> = ({
  dataConfig,
  showAlways = false,
  uaType,
}: PhoneIslandProps) => {
  const CONFIG: string[] = Base64.atob(dataConfig || '').split(':')
  const HOST_NAME: string = CONFIG[0]
  const USERNAME: string = CONFIG[1]
  const AUTH_TOKEN: string = CONFIG[2]
  const SIP_EXTEN: string = CONFIG[3]
  const SIP_SECRET: string = CONFIG[4]
  const SIP_HOST: string = CONFIG[5]
  const SIP_PORT: string = CONFIG[6]

  // Initialize the state to manage the reload events
  const [reload, setReload] = useState<boolean>(false)
  const [reloadedWebRTC, setReloadedWebRTC] = useState<boolean>(false)
  const [reloadedSocket, setReloadedSocket] = useState<boolean>(false)

  useEffect(() => {
    const worker = new Worker(wakeUpWorker, { type: 'module' })
    worker.onmessage = (event: MessageEvent<string>) => {
      // Handle wakeup message
      if (event.data === 'wakeup') {
        setReload(true)
      }
    }

    return () => {
      worker.terminate()
    }
  }, [])

  useEffect(() => {
    if (reloadedSocket && reloadedWebRTC) {
      setReload(false)
      setReloadedWebRTC(false)
      setReloadedSocket(false)
    }
  }, [reloadedSocket, reloadedWebRTC])

  useEventListener('phone-island-expand', () => {
    store.dispatch.island.toggleIsOpen(true)
    eventDispatch('phone-island-expanded', {})
  })
  useEventListener('phone-island-compress', () => {
    store.dispatch.island.toggleIsOpen(false)
    eventDispatch('phone-island-compressed', {})
  })

  useEventListener('phone-island-call-keypad-close', () => {
    store.dispatch.island.setIslandView('call')
    eventDispatch('phone-island-call-keypad-closed', {})
  })
  useEventListener('phone-island-call-transfer-close', () => {
    store.dispatch.island.setIslandView('call')
    eventDispatch('phone-island-call-transfer-closed', {})
  })
  useEventListener('phone-island-recording-close', () => {
    store.dispatch.island.setIslandView(null)
    eventDispatch('phone-island-recording-closed', {})
  })
  useEventListener('phone-island-audio-player-close', () => {
    store.dispatch.island.setIslandView(null)
    eventDispatch('phone-island-audio-player-closed', {})
  })

  useEventListener('phone-island-detach', (data) => {
    detach()
    eventDispatch('phone-island-detached', {})
  })

  useEventListener('phone-island-audio-input-change', (data: DeviceInputOutputTypes) => {
    setJSONItem('phone-island-audio-input-device', { deviceId: data.deviceId })
    eventDispatch('phone-island-audio-input-changed', {})
  })

  useEventListener('phone-island-video-input-change', (data: DeviceInputOutputTypes) => {
    setJSONItem('phone-island-video-input-device', { deviceId: data.deviceId })
    eventDispatch('phone-island-video-input-changed', {})
  })

  const [firstRender, setFirstRender] = useState(true)
  const [firstAudioOutputInit, setFirstAudioOutputInit] = useState(true)

  // Initialize application on first render
  useEffect(() => {
    const initParamUrl = async () => {
      try {
        const paramUrlResponse: any = await getParamUrl()
        const url = paramUrlResponse?.url || ''
        const isValid = url && url.trim() !== ''

        // Save data inside the store
        store.dispatch.paramUrl.setParamUrl({
          url: url,
          onlyQueues: paramUrlResponse?.only_queues || false,
          hasValidUrl: isValid,
        })
      } catch (error) {
        console.error('Error fetching URL parameter:', error)
        store.dispatch.paramUrl.setParamUrl({
          url: '',
          onlyQueues: false,
          hasValidUrl: false,
        })
      }
    }

    if (firstRender) {
      // Initialize i18n
      initI18n()
      // Initialize param URL
      initParamUrl()
      setFirstRender(false)
    }
  }, [firstRender])

  useEventListener('phone-island-audio-output-change', (data: DeviceInputOutputTypes) => {
    const trySetSinkId = async () => {
      const remoteAudioElement: any = store.getState().player.remoteAudio

      if (!remoteAudioElement?.current) {
        console.warn('Remote audio element not available')
        return
      }

      try {
        // Try to set sink ID directly first (works if audio element is already active)
        await remoteAudioElement.current.setSinkId(data.deviceId)
        console.info('Default audio output device changed successfully!')

        // Save device to localStorage
        setJSONItem('phone-island-audio-output-device', { deviceId: data.deviceId })
        eventDispatch('phone-island-audio-output-changed', {})

      } catch (err) {
        console.log('Direct setSinkId failed, trying with temporary stream:', err)

        try {
          // Create a temporary silent audio stream to activate the audio element
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          // Create silent audio
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0, audioContext.currentTime) // Silent

          oscillator.connect(gainNode)

          // Get MediaStream from audio context
          const destination = audioContext.createMediaStreamDestination()
          gainNode.connect(destination)

          // Set the stream to the audio element
          remoteAudioElement.current.srcObject = destination.stream

          // Start the oscillator
          oscillator.start()

          // Try setSinkId again after a short delay
          setTimeout(async () => {
            try {
              await remoteAudioElement.current.setSinkId(data.deviceId)
              console.info('Default audio output device changed successfully with temporary stream!')

              // Clean up temporary stream
              oscillator.stop()
              audioContext.close()
              remoteAudioElement.current.srcObject = null

              // Save device to localStorage
              setJSONItem('phone-island-audio-output-device', { deviceId: data.deviceId })
              eventDispatch('phone-island-audio-output-changed', {})

            } catch (finalErr) {
              console.error('Final setSinkId attempt failed:', finalErr)

              // Clean up on failure
              oscillator.stop()
              audioContext.close()
              remoteAudioElement.current.srcObject = null

              // Save device preference anyway for future calls
              setJSONItem('phone-island-audio-output-device', { deviceId: data.deviceId })
              eventDispatch('phone-island-audio-output-changed', {})
            }
          }, 100)

        } catch (streamErr) {
          console.error('Failed to create temporary audio stream:', streamErr)

          // Fallback: save device preference for future calls
          setJSONItem('phone-island-audio-output-device', { deviceId: data.deviceId })
          eventDispatch('phone-island-audio-output-changed', {})
        }
      }
    }

    trySetSinkId()
  })

  // Listen for the operator status change
  useEventListener('phone-island-presence-change', (data: any) => {
    changeOperatorStatus(data)
    eventDispatch('phone-island-presence-changed', {})
  })

  useEventListener('phone-island-view-changed', (data) => {
    const viewType = data?.viewType
    store.dispatch.island.setIslandView(viewType)
  })

  const remoteAudioElement: any = store.getState().player.remoteAudio

  //get output device from localstorage
  useEffect(() => {
    if (firstAudioOutputInit && remoteAudioElement) {
      const defaultAudioOutputDevice: any = getJSONItem(
        `phone-island-audio-output-device`,
      )?.deviceId
      eventDispatch('phone-island-audio-output-change', {
        deviceId: defaultAudioOutputDevice,
      })
      setFirstAudioOutputInit(false)
    }
  }, [firstAudioOutputInit, remoteAudioElement])

  useEffect(() => {
    checkDarkTheme()
  }, [])

  useEventListener('phone-island-theme-change', (theme: any) => {
    setTheme(theme?.selectedTheme)
  })

  useEventListener('phone-island-default-device-change', (data) => {
    store.dispatch.currentUser.updateCurrentDefaultDevice(data?.deviceInformationObject)
    eventDispatch('phone-island-default-device-changed', {})
  })

  useEventListener('phone-island-alert', (alertType: any) => {
    store.dispatch.alerts.setAlert(alertType.toString())
  })

  // Manually check if internet connection is enabled or not
  useEventListener('phone-island-check-connection', () => {
    checkInternetConnection().then((internetIsActive) => {
      if (internetIsActive) {
        eventDispatch('phone-island-internet-connected', {})
      } else {
        eventDispatch('phone-island-internet-disconnected', {})
      }
    })
  })

  // Check internet connection every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkInternetConnection().then((internetIsActive) => {
        if (internetIsActive) {
          eventDispatch('phone-island-internet-connected', {})
        } else {
          eventDispatch('phone-island-internet-disconnected', {})
        }
      })
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  useEventListener('phone-island-main-presence', (data: any) => {
    const currentUsernameInformation: any = store.getState().currentUser?.username
    const currentUserObject: any = store.getState().currentUser
    let mainPresenceValueBeforeUpdate = currentUserObject?.mainPresence
    if (
      currentUsernameInformation !== undefined &&
      currentUsernameInformation !== '' &&
      !isEmpty(data[currentUsernameInformation]) &&
      data[currentUsernameInformation]?.mainPresence !== undefined
    ) {
      let newMainPresenceValue = data[currentUsernameInformation]?.mainPresence
      store.dispatch.currentUser.updateMainPresence(data[currentUsernameInformation]?.mainPresence)
      let mainPresenceValueAfterUpdate = newMainPresenceValue
      if (mainPresenceValueAfterUpdate === 'online' && mainPresenceValueBeforeUpdate !== 'online') {
        eventDispatch('phone-island-call-ended', {})
      }
    }
  })

  useEventListener('phone-island-call-status', () => {
    const callInformation = store.getState().currentCall
    console.log('Call status debug informations: ', callInformation)
  })

  const openParameterizedUrl = (callerNum: any, callerName: any, called: any, uniqueId: any) => {
    const paramUrlInfo = store.getState().paramUrl

    if (!paramUrlInfo?.hasValidUrl) {
      return
    }

    const paramUrl = paramUrlInfo.url || ''

    if (!paramUrl) {
      return
    }

    const { urlOpened } = store.getState().island
    const openParamUrlType = paramUrlInfo.openParamUrlType

    if (urlOpened && openParamUrlType !== 'button') {
      return
    }

    let processedUrl = paramUrl

    if (processedUrl.includes('$CALLER_NUMBER') && callerNum) {
      processedUrl = processedUrl.replace(/\$CALLER_NUMBER/g, encodeURIComponent(callerNum))
    }
    if (processedUrl.includes('$CALLER_NAME') && callerName) {
      processedUrl = processedUrl.replace(/\$CALLER_NAME/g, encodeURIComponent(callerName))
    }
    if (processedUrl.includes('$UNIQUEID') && uniqueId) {
      processedUrl = processedUrl.replace(/\$UNIQUEID/g, encodeURIComponent(uniqueId))
    }
    if (processedUrl.includes('$CALLED') && called) {
      processedUrl = processedUrl.replace(/\$CALLED/g, encodeURIComponent(called))
    }
    if (processedUrl.includes('{phone}') && callerNum) {
      processedUrl = processedUrl.replace(/\{phone\}/g, encodeURIComponent(callerNum))
    }

    const formattedUrl = processedUrl.startsWith('http') ? processedUrl : `https://${processedUrl}`

    if (uaType !== 'mobile') {
      const newWindow = window.open('about:blank', '_blank')
      if (newWindow) {
        newWindow.location.href = formattedUrl
        store.dispatch.island.setUrlOpened(true)
      }
    } else {
      eventDispatch('phone-island-url-parameter-opened-external', { formattedUrl })
    }
  }

  useEventListener('phone-island-already-opened-external-page', () => {
    store.dispatch.island.setUrlOpened(true)
  })

  useEventListener('phone-island-url-parameter-opened', (data) => {
    const paramUrlInfo = store.getState().paramUrl

    if (!paramUrlInfo.hasValidUrl) {
      return
    }

    const { urlOpened } = store.getState().island
    if (urlOpened) {
      return
    }

    const onlyQueues = paramUrlInfo.onlyQueues || false
    const throughTrunk = isFromTrunk(data?.counterpartNum)
    store.dispatch.paramUrl.setThroughTrunk(throughTrunk)

    if (data?.direction === 'in') {
      if (onlyQueues === true && data?.throughQueue === true) {
        openParameterizedUrl(
          data?.counterpartNum,
          data?.counterpartName,
          data?.owner,
          data?.uniqueId,
        )
      } else if (onlyQueues === false && (throughTrunk === true || data?.throughQueue === true)) {
        openParameterizedUrl(
          data?.counterpartNum,
          data?.counterpartName,
          data?.owner,
          data?.uniqueId,
        )
      }
    }
  })

  useEventListener('phone-island-user-status', () => {
    const userInformation = store.getState().currentUser
    console.log('User status debug informations: ', userInformation)
  })

  useEventListener('phone-island-all-users-status', () => {
    const allUsersInformation = store.getState().users
    console.log('Users status debug informations: ', allUsersInformation)
  })

  useEventListener('phone-island-status', () => {
    const phoneIslandInformation = store.getState().island
    console.log('Phone island status debug informations: ', phoneIslandInformation)
  })

  useEventListener('phone-island-webrtc-status', () => {
    const webrtcInformation = store.getState().webrtc
    console.log('Webrtc status debug informations: ', webrtcInformation)
  })

  useEventListener('phone-island-player-status', () => {
    const playerInformation = store.getState().player
    console.log('Player status debug informations: ', playerInformation)
  })

  useEventListener('phone-island-conference-status', () => {
    const conferenceInformation = store.getState().conference
    console.log('Webrtc status debug informations: ', conferenceInformation)
  })

  useEventListener('phone-island-streaming-status', () => {
    const streamingInformation = store.getState().streaming
    console.log('Streaming status debug informations: ', streamingInformation)
  })

  useEventListener('phone-island-paramurl-status', () => {
    const paramurl = store.getState().paramUrl
    console.log('Paramurl status debug informations: ', paramurl)
  })

  useEventListener('phone-island-player-force-stop', () => {
    store.dispatch.player.reset()
    console.log('Audio player is interrupted')
  })

  useEventListener('phone-island-sideview-open', () => {
    store.dispatch.island.toggleSideViewVisible(true)
    store.dispatch.island.setUrlOpened(false)
    eventDispatch('phone-island-sideview-opened', {})
  })

  useEventListener('phone-island-sideview-close', () => {
    store.dispatch.island.toggleSideViewVisible(false)
    eventDispatch('phone-island-sideview-closed', {})
  })

  useEventListener('phone-island-size-change', (args: any) => {
    const { sideViewIsVisible } = store.getState().island

    // Get current dimensions from args
    const { sizeInformation } = args

    // // Calculate extra row dimension ( side view and back call )
    const updatedSizeInformation = {
      ...sizeInformation,
      right: sideViewIsVisible ? '42px' : '0px',
      top: isBackCallActive() ? '40px' : '0px',
    }
    eventDispatch('phone-island-size-changed', { sizes: updatedSizeInformation })
  })

  // Listen for the call end event and set the island size to 0
  useEventListener('phone-island-call-ended', () => {
    const { mainPresence } = store.getState().currentUser
    if (mainPresence === 'online') {
      const sizeInformation: any = {
        width: '0px',
        height: '0px',
      }
      eventDispatch('phone-island-size-change', { sizeInformation })
      eventDispatch('phone-island-sideview-close', {})
      store.dispatch.island.resetIslandStore()
      store.dispatch.paramUrl.setThroughTrunk(false)
    }
  })

  useEventListener('phone-island-conference-list-open', () => {
    store.dispatch.island.toggleConferenceList(true)
    eventDispatch('phone-island-conference-list-opened', {})
  })

  useEventListener('phone-island-alert-removed', (alertRemovedType) => {
    // Get current alerts status
    const { activeAlertsCount } = store.getState().alerts.status
    const { view, previousView } = store.getState().island
    const { isActive } = store.getState().conference
    const alertsData = store.getState().alerts.data
    const currentCall = store.getState().currentCall
    const { incoming, outgoing, accepted } = currentCall

    // Check if alert type was provided
    const alertType = alertRemovedType?.type

    // Check if user is in a call
    const isInCall =
      currentCall.incoming ||
      currentCall.outgoing ||
      currentCall.accepted ||
      currentCall.conversationId !== ''

    // Determine if the island should remain visible
    const shouldKeepVisible =
      incoming ||
      outgoing ||
      accepted ||
      activeAlertsCount > 0 ||
      view === 'player' ||
      view === 'recorder' ||
      view === 'physicalPhoneRecorder' ||
      (view === 'waitingConference' && isActive) ||
      (view === 'transfer' && isActive) ||
      (view === 'settings' && isActive) ||
      (view === 'settings' && (previousView === 'recorder' || previousView === 'player'))

    // Reset the island store only if:
    // 1. The island should not remain visible
    // 2. No more active alerts
    // 3. The specific alert is not active anymore
    // 4. User is not currently in a call
    if (
      !shouldKeepVisible &&
      activeAlertsCount === 0 &&
      (!alertType || (alertsData[alertType] && !alertsData[alertType].active)) &&
      !isInCall
    ) {
      const sizeInformation: any = {
        width: '0px',
        height: '0px',
      }
      eventDispatch('phone-island-size-change', { sizeInformation })
      eventDispatch('phone-island-sideview-close', {})
      store.dispatch.island.resetIslandStore()
    }
  })

  useEventListener('phone-island-conference-list-close', () => {
    store.dispatch.island.toggleConferenceList(false)
    eventDispatch('phone-island-conference-list-closed', {})
  })

  // Listen for conversations updates to handle 'answered' preference for parameterized URL
  useEventListener('phone-island-conversations', (data: any) => {
    // Get the current username (first key in the data object)
    const username = Object.keys(data)[0]
    const currentUsernameInformation: any = store.getState().currentUser?.username

    if (username === currentUsernameInformation) {
      const conversations = data[username].conversations
      const paramUrlInfo = store.getState().paramUrl
      const { urlOpened } = store.getState().island

      // Only proceed if URL is valid and not already opened
      if (!paramUrlInfo.hasValidUrl || urlOpened) {
        return
      }

      // Check if the openParamUrlType is set to 'answered'
      if (paramUrlInfo.openParamUrlType === 'answered') {
        // Check if there are any conversations
        if (conversations && Object.keys(conversations).length > 0) {
          // Get the first conversation (usually there's only one active call)
          const convId = Object.keys(conversations)[0]
          const conv = conversations[convId]

          // Check conditions: must be connected and incoming
          if (conv?.connected && conv?.direction === 'in') {
            const onlyQueues = paramUrlInfo.onlyQueues || false
            const calculatedThroughTrunk = isFromTrunk(conv.counterpartNum)
            // Update throughTrunk in paramUrl store
            store.dispatch.paramUrl.setThroughTrunk(calculatedThroughTrunk)

            // Check queue conditions based on preferences
            if (onlyQueues === true && conv?.throughQueue === true) {
              // Open URL only for queue calls when onlyQueues is true
              openParameterizedUrl(
                conv.counterpartNum,
                conv.counterpartName,
                conv.owner,
                conv.uniqueId,
              )
            } else if (
              onlyQueues === false &&
              (calculatedThroughTrunk === true || conv?.throughQueue === true)
            ) {
              // Open URL for both trunk and queue calls when onlyQueues is false
              openParameterizedUrl(
                conv.counterpartNum,
                conv.counterpartName,
                conv.owner,
                conv.uniqueId,
              )
            }
          }
        }
      }
    }
  })

  return (
    <>
      <Provider store={store}>
        <WebRTC
          hostName={HOST_NAME}
          sipExten={SIP_EXTEN}
          sipSecret={SIP_SECRET}
          sipHost={SIP_HOST}
          sipPort={SIP_PORT}
          reload={reload}
          reloadedCallback={() => setReloadedWebRTC(true)}
          uaType={uaType}
        >
          <RestAPI hostName={HOST_NAME} username={USERNAME} authToken={AUTH_TOKEN}>
            <Socket
              hostName={HOST_NAME}
              username={USERNAME}
              authToken={AUTH_TOKEN}
              reload={reload}
              reloadedCallback={() => setReloadedSocket(true)}
              uaType={uaType}
            >
              <Events sipHost={SIP_HOST}>
                <Island showAlways={showAlways} uaType={uaType} />
              </Events>
            </Socket>
          </RestAPI>
        </WebRTC>
      </Provider>
    </>
  )
}

PhoneIsland.displayName = 'PhoneIsland'
