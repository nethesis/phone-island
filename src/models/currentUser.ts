// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type { UserInfoTypes } from '../types'

const defaultState: CurrentUserTypes = {
  currentUserReady: false,
}

export const currentUser = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateCurrentUser: (state, payload: UserInfoTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
    setCurrentUserReady: (state, payload: boolean) => {
      return {
        ...state,
        currentUserReady: payload,
      }
    },
  },
})

interface CurrentUserTypes extends UserInfoTypes {
  currentUserReady: boolean
}
