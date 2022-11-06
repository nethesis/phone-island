// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Story, Meta } from '@storybook/react'
import App from '../App'

const meta = {
  title: 'App Widget',
  component: App,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<any> = (args) => <App {...args} />

export const Default = Template.bind({})
Default.args = {}
