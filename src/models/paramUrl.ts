// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: ParamUrlTypes = {
  url: '',
  onlyQueues: false,
  hasValidUrl: false,
  openParamUrlType: 'never',
}

export const paramUrl = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setParamUrl: (
      state,
      payload: { url?: string; onlyQueues?: boolean; hasValidUrl?: boolean; openParamUrlType?: string },
    ) => {
      return {
        url: payload.url || '',
        onlyQueues: payload.onlyQueues || false,
        hasValidUrl: payload.hasValidUrl || false,
        openParamUrlType: payload.openParamUrlType || state.openParamUrlType,
      }
    },
    setOpenParamUrlType: (state, payload: string) => {
      return {
        ...state,
        openParamUrlType: payload,
      }
    },
    reset: () => {
      return defaultState
    },
  },
})

interface ParamUrlTypes {
  url: string
  onlyQueues: boolean
  hasValidUrl: boolean
  openParamUrlType: string
}
