import React, { type FC, useState, useEffect } from 'react'
import { Events, Socket, WebRTC, Island, RestAPI } from './components'
import { Provider } from 'react-redux'
import { store } from './store'
import { Base64 } from 'js-base64'
import wakeUpWorker from './workers/wake_up'
import loadI18n from './lib/i18n'

import 'react-tooltip/dist/react-tooltip.css'
import { useEventListener, eventDispatch, setJSONItem } from './utils'
import { detach } from './lib/webrtc/messages'

interface PhoneIslandProps {
  dataConfig: string
  showAlways?: boolean
}

interface DeviceInputOutputTypes {
  deviceId: string
}

export const PhoneIsland: FC<PhoneIslandProps> = ({ dataConfig, showAlways = false }) => {
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
    store.dispatch.currentUser.updateCurrentDefaultDevice(data?.deviceInformationObject)
    eventDispatch('phone-island-detached', {})
  })

  useEventListener('phone-island-audio-input-change', (data: DeviceInputOutputTypes) => {
    setJSONItem('phone-island-audio-input-device', { deviceId: data.deviceId })
    eventDispatch('phone-island-audio-input-changed', {})
  })
  useEventListener('phone-island-audio-output-change', (data: DeviceInputOutputTypes) => {
    // set audio output
    /*remoteAudioElement?.current
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
      })*/
  })

  const [firstRenderI18n, setFirstRenderI18n] = useState(true)
  //initialize i18n
  useEffect(() => {
    if (firstRenderI18n) {
      loadI18n()
      setFirstRenderI18n(false)
    }
  }, [firstRenderI18n])

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
        >
          <RestAPI hostName={HOST_NAME} username={USERNAME} authToken={AUTH_TOKEN}>
            <Socket
              hostName={HOST_NAME}
              username={USERNAME}
              authToken={AUTH_TOKEN}
              reload={reload}
              reloadedCallback={() => setReloadedSocket(true)}
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
