// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: ParamUrlTypes = {
  url: '',
  onlyQueues: false,
  hasValidUrl: false,
}

export const paramUrl = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setParamUrl: (
      state,
      payload: { url?: string; onlyQueues?: boolean; hasValidUrl?: boolean },
    ) => {
      return {
        url: payload.url || '',
        onlyQueues: payload.onlyQueues || false,
        hasValidUrl: payload.hasValidUrl || false,
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
}
