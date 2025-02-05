import React, { type FC, useState, useEffect } from 'react'
import { Events, Socket, WebRTC, Island, RestAPI } from './components'
import { Provider } from 'react-redux'
import { store } from './store'
import { Base64 } from 'js-base64'
import wakeUpWorker from './workers/wake_up'
import loadI18n from './lib/i18n'
import i18next, { i18n } from 'i18next'

import 'react-tooltip/dist/react-tooltip.css'
import { useEventListener, eventDispatch, setJSONItem, getJSONItem } from './utils'
import { detach } from './lib/webrtc/messages'
import { checkDarkTheme, setTheme } from './lib/darkTheme'
import { changeOperatorStatus } from './services/user'
import { isEmpty } from './utils/genericFunctions/isEmpty'
import { checkInternetConnection } from './utils/genericFunctions/checkConnection'

interface PhoneIslandProps {
  dataConfig: string
  i18nLoadPath?: string
  showAlways?: boolean
  uaType: string
}

interface DeviceInputOutputTypes {
  deviceId: string
}

export const PhoneIsland: FC<PhoneIslandProps> = ({
  dataConfig,
  i18nLoadPath = undefined,
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

  useEventListener('phone-island-audio-output-change', (data: DeviceInputOutputTypes) => {
    const remoteAudioElement: any = store.getState().player.remoteAudio
    // set audio output
    remoteAudioElement?.current
      .setSinkId(data.deviceId)
      .then(function () {
        console.info('Default audio output device change with success!')
        // set device to localstorage
        setJSONItem('phone-island-audio-output-device', { deviceId: data.deviceId })

        // dispatch event
        eventDispatch('phone-island-audio-output-changed', {})
      })
      .catch(function (err) {
        console.error('Default audio output device change error:', err)
      })
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

  const [firstRenderI18n, setFirstRenderI18n] = useState(true)
  const [firstAudioOutputInit, setFirstAudioOutputInit] = useState(true)

  //initialize i18n
  useEffect(() => {
    if (firstRenderI18n) {
      loadI18n(i18nLoadPath)
      setFirstRenderI18n(false)
    }
  }, [firstRenderI18n])

  const remoteAudioElement: any = store.getState().player.remoteAudio

  //get output device from localstorage
  useEffect(() => {
    if (firstAudioOutputInit && remoteAudioElement) {
      const defaultAudioOutputDevice: any = getJSONItem(
        `phone-island-audio-output-device`,
      )?.deviceId
      eventDispatch('phone-island-audio-output-change', { deviceId: defaultAudioOutputDevice })
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

  useEventListener('phone-island-user-status', () => {
    const userInformation = store.getState().currentUser
    console.log('User status debug informations: ', userInformation)
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
                <Island showAlways={showAlways} />
              </Events>
            </Socket>
          </RestAPI>
        </WebRTC>
      </Provider>
    </>
  )
}

PhoneIsland.displayName = 'PhoneIsland'
