// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

export interface ScreenShareTypes {
  plugin?: any
  role?: string
  room?: string
  source?: string
  localTracks?: any //// remove?
  localVideos?: number
  localScreenStream?: MediaStream
}

const defaultState = {
  plugin: null as any,
  role: '',
  room: '',
  source: '',
  localTracks: null as any,
  localVideos: 0,
  localScreenStream: null as MediaStream | null,
}

export const screenShare = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    update: (state, payload: ScreenShareTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
  },
})
