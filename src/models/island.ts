// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: IslandTypes = {
  view: null,
  isOpen: true,
  actionsExpanded: false,
  startPosition: {
    x: 0,
    y: 0,
  },
}

export const island = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setIslandView: (state, payload: IslandViewType | null) => {
      return {
        ...state,
        view: payload,
      }
    },
    toggleIsOpen: (state, payload: boolean) => {
      return {
        ...state,
        isOpen: payload,
      }
    },
    toggleActionsExpanded: (state, payload: boolean) => {
      state.actionsExpanded = payload
      return state
    },
  },
  effects: (dispatch) => ({
    handleToggleIsOpen: (_: void, rootState) => {
      if (
        rootState.island.isOpen &&
        rootState.alerts.status.activeAlertsCount > 0 &&
        !rootState.currentCall.displayName
      ) {
        dispatch.island.toggleIsOpen(true)
      } else {
        dispatch.island.toggleIsOpen(!rootState.island.isOpen)
      }
    },
  }),
})

type IslandViewType = 'call' | 'keypad' | 'player' | 'transfer' | 'recorder'

interface IslandTypes {
  view?: IslandViewType | null
  isOpen: boolean
  actionsExpanded: boolean
  startPosition: {
    x: number
    y: number
  }
}
