// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Story, Meta } from '@storybook/react'
import React from 'react'
import { PhoneIsland } from '../App'
import { eventDispatch, useEventListener } from '../utils'

const meta = {
  title: 'Default',
  component: PhoneIsland,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

// Uses the configuration token from .env
const config = process.env.CONFIG_TOKEN

const Template: Story<any> = (args) => {
  const handleCallStart = () => {
    eventDispatch('phone-island-call-start', { number: process.env.DEST_NUMBER })
  }

  useEventListener('phone-island-main-presence', (data) => {
    // Manege the mainPresence data
  })

  useEventListener('phone-island-conversations', (data) => {
    // Manage the conversations data
  })

  useEventListener('phone-island-outgoing-call-started', (data) => {
    // Manage the conversations data
  })

  useEventListener('phone-island-queue-update', (data) => {
    // Manage the queue update data
    console.warn(data)
  })

  useEventListener('phone-island-queue-member-update', (data) => {
    // Manage the queue member update data
    console.warn(data)
  })

  return (
    <>
      <button
        onClick={handleCallStart}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Call
      </button>
      <PhoneIsland dataConfig={config} showAlways={false} {...args} />
    </>
  )
}

export const Default = Template.bind({})
Default.args = {}

// Useful to test component unmount
export function Empty() {
  return <>Use this to disconnection, unregister, reconnection and more.</>
}
