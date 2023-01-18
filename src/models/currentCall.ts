// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface CurrentCallTypes {
  displayName?: string
  number?: string
  incoming?: boolean
  accepted?: boolean
  outgoing?: boolean
  startTime?: string
}

const defaultState = {
  displayName: '',
  number: '',
  incoming: false,
  accepted: false,
  outgoing: false,
  startTime: '',
}

export const currentCall = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateCurrentCall: (state, payload: CurrentCallTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
    reset: () => {
      return defaultState
    },
  },
})
