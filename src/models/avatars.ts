// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type { AvatarsTypes } from '../types'

const defaultState: AvatarsStoreTypes = {
  avatars: null,
}

export const avatars = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateAvatars: (state, payload: AvatarsTypes) => {
      return {
        ...state,
        avatars: payload,
      }
    },
  },
})

export interface AvatarsStoreTypes {
  avatars: AvatarsTypes | null
}
