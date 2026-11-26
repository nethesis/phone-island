// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

export interface ScreenShareTypes {
  active?: boolean
  plugin?: any
  role?: 'publisher' | 'listener' | ''
  room?: string | number
  source?: string
  remoteFeed?: any
  localTracks?: any
  remoteTracks?: any
  localVideos?: number
  remoteVideos?: number
  localScreenStream?: MediaStream | null
  pendingScreenStream?: MediaStream | null
  remoteScreenStream?: MediaStream | null
  isStartingScreenShare?: boolean
  isJoiningScreenShare?: boolean
  isLeavingScreenShare?: boolean
}

const defaultState = {
  active: false,
  plugin: null as any,
  role: '',
  room: '' as string | number,
  source: '',
  remoteFeed: null as any,
  localTracks: null as any,
  remoteTracks: null as any,
  localVideos: 0,
  remoteVideos: 0,
  localScreenStream: null as MediaStream | null,
  pendingScreenStream: null as MediaStream | null,
  remoteScreenStream: null as MediaStream | null,
  isStartingScreenShare: false,
  isJoiningScreenShare: false,
  isLeavingScreenShare: false,
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
