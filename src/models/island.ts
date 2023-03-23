// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: IslandTypes = {
  view: null,
  isOpen: true,
  startPosition: {
    x: 0,
    y: 0,
  },
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

type IslandViewType = 'call' | 'keypad' | 'player' | 'transfer_list' | 'transfer_actions'

interface IslandTypes {
  view?: IslandViewType | null
  isOpen: boolean
  startPosition: {
    x: number
    y: number
  }
}
