// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: MediaDevicesTypes = {
  mediaDevices: [],
}

export const mediaDevices = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateMediaDevices: (state, payload: MediaDeviceInfo[]) => {
      return {
        ...state,
        mediaDevices: payload,
      }
    },
  },
  selectors: (slice) => ({
    videoInputDevices: () =>
      slice((state) => state.mediaDevices.filter((device) => device.kind === 'videoinput')),
    audioOutputDevices: () =>
      slice((state) => state.mediaDevices.filter((device) => device.kind === 'audiooutput')),
    audioInputDevices: () =>
      slice((state) => state.mediaDevices.filter((device) => device.kind === 'audioinput')),
  }),
})

interface MediaDevicesTypes {
  mediaDevices: MediaDeviceInfo[]
}
