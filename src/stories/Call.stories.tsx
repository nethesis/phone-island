// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Story, Meta } from '@storybook/react'
import React, { useState } from 'react'
import { PhoneIsland } from '../App'
import { eventDispatch, useEventListener } from '../utils'
import { store } from '../store'
import { setDefaultDevice } from '../services/user'
import audioFile from '../static/test_audio'

const meta = {
  title: 'Phone Island',
  component: PhoneIsland,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

// Uses the configuration token from .env
const config = process.env.CONFIG_TOKEN
const transferNumber = process.env.DEST_TRANSFER_NUMBER
const webrtcNumber: any = process.env.WEBRTC_NUMBER
const physicalNumber: any = process.env.PHYSICAL_NUMBER

const CallTemplate: Story<any> = (args) => {
  const [getEventName, setEventName]: any = useState('phone-island-call-start')
  const [getNumber, setNumber]: any = useState(process.env.DEST_NUMBER_EXTENSION)
  const [getKey, setKey]: any = useState('0')

  const handleExtensionCallStart = () => {
    eventDispatch('phone-island-call-start', { number: process.env.DEST_NUMBER_EXTENSION })
  }

  const handleExternalCallStart = () => {
    eventDispatch('phone-island-call-start', { number: process.env.DEST_NUMBER_EXTERNAL })
  }

  const handleTransferCall = () => {
    eventDispatch('phone-island-transfer-call', { to: process.env.DEST_TRANSFER_NUMBER })
  }

  const handleListen = () => {
    eventDispatch('phone-island-listen-call', { to: process.env.DEST_LISTEN_NUMBER })
  }

  const handleIntrude = () => {
    eventDispatch('phone-island-intrude-call', { to: process.env.DEST_INTRUDE_NUMBER })
  }

  useEventListener('phone-island-call-ringing', () => {
    console.log("The call is ringing")
  })

  const launchEvent = () => {
    eventDispatch(
      getEventName,
      getEventName == 'phone-island-call-keypad-send'
        ? { key: getKey }
        : getEventName == 'phone-island-audio-player-start'
        ? { base64_audio_file: audioFile, description: 'Custom Audio File' }
        : { number: getNumber },
    )
  }

  const handleEventChange = (event: any) => {
    event.preventDefault()
    const example = event.target.value
    setEventName(example)
  }
  const handleNumberChange = (event: any) => {
    event.preventDefault()
    const example = event.target.value
    setNumber(example)
  }
  const handleKeyChange = (event: any) => {
    event.preventDefault()
    const example = event.target.value
    setKey(example)
  }

  const resetListenStatus = () => {
    store.dispatch.listen.reset()
  }

  let transferObject: any = {}
  transferObject.to = transferNumber

  return (
    <div className='pi-flex pi-gap-2 pi-flex-col pi-w-fit'>
      <button
        onClick={handleExtensionCallStart}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Call Extension Number ({process.env.DEST_NUMBER_EXTENSION})
      </button>
      <button
        onClick={handleExternalCallStart}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Call External Number ({process.env.DEST_NUMBER_EXTERNAL})
      </button>
      <button
        onClick={() => handleTransferCall()}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Transfer ({process.env.DEST_TRANSFER_NUMBER})
      </button>
      <button
        onClick={() => handleListen()}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Listen ({process.env.DEST_LISTEN_NUMBER})
      </button>
      <button
        onClick={() => handleIntrude()}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Intrude ({process.env.DEST_INTRUDE_NUMBER})
      </button>
      <button
        onClick={() => resetListenStatus()}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Reset listen and intrude store status
      </button>

      <input
        id='input-event'
        type='text'
        className=''
        value={getEventName}
        onChange={handleEventChange}
      />
      <input
        id='input-number'
        type='text'
        className=''
        value={getNumber}
        onChange={handleNumberChange}
      />
      <input id='input-key' type='text' className='' value={getKey} onChange={handleKeyChange} />
      <button onClick={() => launchEvent()}>Launch {getEventName}</button>

      <PhoneIsland dataConfig={config} showAlways={false} {...args} />
    </div>
  )
}

export const Call = CallTemplate.bind({})
Call.args = {}
