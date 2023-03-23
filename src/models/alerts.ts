// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: AlertsTypes = {
  data: {
    // Alerts that break calls
    browser_permissions: {
      active: false,
      break: true,
      message: "The browser doesn't have permission to access camera or microphone.",
    },
    user_permissions: {
      active: false,
      break: true,
      message: 'You must accept audio and video permissions.',
    },
    unknown_media_permissions: {
      active: false,
      break: true,
      message: "Web Phone can't access audio or camera on this device.",
    },
    webrtc_down: {
      active: false,
      break: true,
      message: 'Web Phone connection is down.',
    },
    socket_down: {
      active: false,
      break: false,
      message: 'Server connection is down.',
    },
    // Warning alerts
    busy_camera: {
      active: false,
      message: 'Camera is used by another application.',
    },
    // Success alerts
    call_transfered: {
      active: false,
      success: true,
      message: 'Call transferred successfully.',
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
}
