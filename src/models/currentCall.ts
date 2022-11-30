// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface CurrentCallTypes {
  displayName?: string
  incoming?: boolean
  ringing?: boolean
  accepted?: boolean
}

const defaultState = {
  displayName: '',
  incoming: false,
  ringing: false,
  accepted: false,
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
  },
})
