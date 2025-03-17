// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

// Common dimensions
const commonCollapsed = {
  width: 168,
  height: 40,
}

const commonExpanded = {
  width: 348,
  height: 304,
}

const defaultState = {
  padding_expanded: 24,
  alert_padding_expanded: 2,
  padding_x_collapsed: 8,
  padding_y_collapsed: 16,
  border_radius_expanded: 20,
  border_radius_collapsed: 99,
  variants: {
    call: {
      expanded: {
        incoming: { width: 418, height: 96 },
        outgoing: { width: 418, height: 96 },
        accepted: {
          width: 348,
          height: 236,
          actionsExpanded: commonExpanded,
        },
        listening: { width: 348, height: 168 },
        transfer: {
          width: 348,
          height: 236,
          actionsExpanded: commonExpanded,
        },
      },
      collapsed: commonCollapsed,
    },
    keypad: {
      expanded: { width: 338, height: 400 },
      collapsed: commonCollapsed,
    },
    transfer: {
      expanded: { width: 408, height: 410 },
      collapsed: commonCollapsed,
    },
    player: {
      expanded: { width: 374, height: 236 },
      collapsed: commonCollapsed,
    },
    recorder: {
      expanded: { width: 374, height: 256 },
      collapsed: commonCollapsed,
    },
    physicalPhoneRecorder: {
      expanded: { width: 374, height: 256 },
      collapsed: commonCollapsed,
    },
    alerts: { width: 418, height: 88 },
    settings: {
      expanded: commonExpanded,
      collapsed: commonCollapsed,
    },
    video: {
      expanded: {
        width: 600,
        height: 480,
      },
      collapsed: commonCollapsed,
    },
    conference: {
      expanded: commonExpanded,
      collapsed: commonCollapsed,
    },
    switchDevice: {
      expanded: commonExpanded,
      collapsed: commonCollapsed,
    },
    waitingConference: {
      expanded: { width: 348, height: 360 },
      collapsed: commonCollapsed,
    },
  },
}

export const motions = createModel<RootModel>()({
  state: defaultState,
})

export type AnimationsTypes = typeof defaultState
