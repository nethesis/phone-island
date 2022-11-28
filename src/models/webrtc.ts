// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface SipcallTypes {
  sipcall: any
}

const defaultState = {
  sipcall: null,
}

export const webrtc = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateSipcall: (state, payload: SipcallTypes) => {
      state.sipcall = payload.sipcall
      return state
    },
  },
})
