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
    eventDispatch('phone-island-call-start', { number: 212 })
  }

  useEventListener('phone-island-main-presence', (data) => {
    // Manege the mainPresence data
  })

  useEventListener('phone-island-conversations', (data) => {
    // Manage the conversations data
  })

  return (
    <>
      <button
        onClick={handleCallStart}
        className='flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 bg-sky-600 text-white border border-transparent hover:bg-sky-700 focus:ring-sky-500 focus:ring-offset-white rounded-md px-3 py-2 text-sm leading-4'
      >
        Call
      </button>
      <PhoneIsland dataConfig={config} always={false} {...args} />
    </>
  )
}

export const Default = Template.bind({})
Default.args = {}
