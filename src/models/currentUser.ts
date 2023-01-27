// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type { UserInfoTypes } from '../services/user'

const defaultState: UserInfoTypes = {}

export const currentUser = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateCurrentUser: (state, payload: UserInfoTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
  },
})
