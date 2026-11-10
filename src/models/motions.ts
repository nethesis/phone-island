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
  border_radius_collapsed_conference: 8,
  variants: {
    call: {
      expanded: {
        incoming: { width: 418, height: 96 },
        incomingQueue: { width: 418, height: 124 },
        // video source calls: the height grows with the preview (previewWidth wide, its height
        // follows the picture aspect ratio) and with the gate chooser row (gatesHeight): height is
        // the rest (the header row and the margin above the preview)
        incomingStreaming: { width: 500, height: 68, previewWidth: 500, gatesHeight: 52 },
        outgoing: { width: 418, height: 96 },
        outgoingStreaming: { width: 500, height: 68, previewWidth: 500, gatesHeight: 52 },
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
      expanded: { width: 374, height: 272 },
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
        padding: 0,
      },
      collapsed: commonCollapsed,
    },
    screenShare: {
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
      collapsed: { width: 180, height: 74 },
    },
    // the height grows with the video (previewWidth wide, its height follows the picture
    // aspect ratio): height is the rest (the buttons row below the video)
    streamingAnswer: {
      expanded: {
        width: 600,
        height: 80,
        previewWidth: 600,
        padding: 0,
      },
      extraLarge: {
        width: 936,
        height: 80,
        previewWidth: 936,
        padding: 0,
      },
      collapsed: commonCollapsed,
    },
    operatorBusy: {
      expanded: { width: 400, height: 104 },
      collapsed: { width: 400, height: 104 },
    },
  },
}

export const motions = createModel<RootModel>()({
  state: defaultState,
})
