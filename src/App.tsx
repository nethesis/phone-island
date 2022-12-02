import React, { FC } from 'react'
import { Events, WebRTC } from './components'
import { Provider } from 'react-redux'
import { store } from './store'
import { Socket } from './components'
import { Base64 } from 'js-base64'
import { useIsomorphicLayoutEffect } from './utils'
import { Island } from './components'

interface PhoneIslandProps {
  dataConfig: string
  always?: boolean
}

export const PhoneIsland: FC<PhoneIslandProps> = ({ dataConfig, always = false }) => {
  const CONFIG: string[] = Base64.atob(dataConfig).split(':')
  const HOST_NAME: string = CONFIG[0]
  const USERNAME: string = CONFIG[1]
  const AUTH_TOKEN: string = CONFIG[2]
  const SIP_EXTEN: string = CONFIG[3]
  const SIP_SECRET: string = CONFIG[4]

  useIsomorphicLayoutEffect(() => {
    const audio: HTMLAudioElement | null = document.querySelector('#audio')
    const localVideo: HTMLVideoElement | null = document.querySelector('#localVideo')
    const remoteVideo: HTMLVideoElement | null = document.querySelector('#remoteVideo')
    store.dispatch.player.updatePlayer({
      audio,
      localVideo,
      remoteVideo,
    })
  }, [])

  return (
    <>
      <Provider store={store}>
        <WebRTC hostName={HOST_NAME} sipExten={SIP_EXTEN} sipSecret={SIP_SECRET}>
          <Socket hostName={HOST_NAME} username={USERNAME} authToken={AUTH_TOKEN}>
            <Events>
              <Island always={always} />
            </Events>
          </Socket>
        </WebRTC>
      </Provider>
    </>
  )
}

PhoneIsland.displayName = 'PhoneIsland'
