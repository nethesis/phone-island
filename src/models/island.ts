// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface IslandTypes {
  view?:  'call' | 'keyboard' | 'player'
}

const defaultState: IslandTypes = {}

export const island = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateIsland: (state, payload: IslandTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
  },
})
