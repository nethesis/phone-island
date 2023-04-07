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

const CallTemplate: Story<any> = (args) => {
  const handleCallStart = () => {
    eventDispatch('phone-island-call-start', { number: process.env.DEST_NUMBER })
  }

  return (
    <>
      <button
        onClick={handleCallStart}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Call Number ({process.env.DEST_NUMBER})
      </button>
      <PhoneIsland dataConfig={config} showAlways={false} {...args} />
    </>
  )
}

export const Call = CallTemplate.bind({})
Call.args = {}
