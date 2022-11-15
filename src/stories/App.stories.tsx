// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Story, Meta } from '@storybook/react'
import React from 'react'
import { App } from '../App'

const meta = {
  title: 'App Widget',
  component: App,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

// On user login
// /me
// /login // Token no expire

const HOST_NAME: string = 'nv-seb'
const USERNAME: string = 'foo1'
const AUTH_TOKEN: string = '791ff10b8666939426eb1b5507e983558f0e5806'
const SIP_EXTEN: string = '211'
const SIP_SECRET: string = '0081a9189671e8c3d1ad8b025f92403da'

const config = btoa(HOST_NAME + ':' + USERNAME + ':' + AUTH_TOKEN + ':' + SIP_EXTEN  + ':' + SIP_SECRET)

console.log(config)

const Template: Story<any> = (args) => <App dataConfig={config} {...args} />

export const Default = Template.bind({})
Default.args = {}
