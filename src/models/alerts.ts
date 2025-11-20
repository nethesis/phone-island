// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: AlertsTypes = {
  data: {
    // Alerts that break calls
    browser_permissions: {
      active: false,
      break: true,
      message: "No microphone or camera permissions.",
      type: 'browser_permissions',
    },
    user_permissions: {
      active: false,
      break: true,
      message: 'You must accept audio and video permissions.',
      type: 'user_permissions',
    },
    unknown_media_permissions: {
      active: false,
      break: true,
      message: "Unknown audio or camera permissions.",
      type: 'unknown_media_permissions',
    },
    webrtc_down: {
      active: false,
      break: true,
      message: 'Click to reconnect',
      type: 'webrtc_down',
    },
    socket_down: {
      active: false,
      break: false,
      message: 'Click to reconnect',
      type: 'socket_down',
    },
    // Warning alerts
    busy_camera: {
      active: false,
      message: 'Camera is already used.',
      type: 'busy_camera',
    },
    // Success alerts
    call_transfered: {
      active: false,
      success: true,
      message: 'Call transferred successfully.',
      type: 'call_transfered',
    },
  },
  status: {
    activeAlertsCount: 0,
    breakActiveAlertsCount: 0,
  },
}

export const alerts = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setAlert: (state, payload: AlertsKeys) => {
      if (!state.data[payload].active) {
        const newActiveAlertsCount = state.status.activeAlertsCount + 1
        const newBreakActiveAlertsCount = state.data[payload].break
          ? state.status.breakActiveAlertsCount + 1
          : state.status.breakActiveAlertsCount

        return {
          ...state,
          data: {
            ...state.data,
            [payload]: {
              ...state.data[payload],
              active: true,
            },
          },
          status: {
            ...state.status,
            activeAlertsCount: newActiveAlertsCount,
            breakActiveAlertsCount: newBreakActiveAlertsCount,
          },
        }
      }
    },
    removeAlert: (state, payload: AlertsKeys) => {
      if (state.data[payload].active) {
        const newActiveAlertsCount = state.status.activeAlertsCount - 1
        const newBreakActiveAlertsCount = state.data[payload].break
          ? state.status.breakActiveAlertsCount - 1
          : state.status.breakActiveAlertsCount

        return {
          data: {
            ...state.data,
            [payload]: {
              ...state.data[payload],
              active: false,
              activeAlertsCount: newActiveAlertsCount,
              breakActiveAlertsCount: newBreakActiveAlertsCount,
            },
          },
          status: {
            ...state.status,
            activeAlertsCount: newActiveAlertsCount,
            breakActiveAlertsCount: newBreakActiveAlertsCount,
          },
        }
      }
    },
    //remove all alerts
    removeAllAlerts: (state) => {
      for (const key in state.data) {
        state.data[key].active = false
      }
      state.status.activeAlertsCount = 0
      state.status.breakActiveAlertsCount = 0
    },
  },
})

export type AlertsTypes = {
  data: { [key in AlertsKeys]: AlertTypes }
  status: {
    activeAlertsCount: number
    breakActiveAlertsCount: number
  }
}

type AlertsKeys =
  | 'browser_permissions'
  | 'user_permissions'
  | 'busy_camera'
  | 'unknown_media_permissions'
  | 'webrtc_down'
  | 'socket_down'
  | 'call_transfered'

export interface AlertTypes {
  active: boolean
  message: string
  break?: boolean // This means that it brokes WebRTC audio calls or Socket connection
  success?: boolean
  type: string
}
