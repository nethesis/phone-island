// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: IslandTypes = {
  isOpen: true,
}

export const island = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setIslandView: (state, payload: IslandViewType) => {
      return {
        ...state,
        view: payload,
      }
    },
    toggleIsOpen: (state) => {
      return {
        ...state,
        isOpen: !state.isOpen,
      }
    },
  },
})

type IslandViewType = 'call' | 'keyboard' | 'player'

interface IslandTypes {
  view?: IslandViewType
  isOpen: boolean
}