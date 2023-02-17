// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type { AvatarsTypes } from '../types'

const defaultState = {
  extensions: null,
  endpoints: null
}

export const extensions = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateExtensions: (state, payload: AvatarsTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
  },
})
