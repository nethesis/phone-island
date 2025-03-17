// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import { eventDispatch } from '../utils'

const defaultState: IslandTypes = {
  view: null,
  isOpen: true,
  actionsExpanded: false,
  startPosition: {
    x: 0,
    y: 0,
  },
  inputOutputOpened: false,
  settingsView: 'main',
  sideViewIsVisible: false,
  isConferenceList: false,
  previousView: null,
  avoidToShow: false,
  isFullScreen: false,
}

export const island = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setIslandView: (state, payload: IslandViewType | null) => {
      return {
        ...state,
        view: payload,
        previousView: state?.view,
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
    toggleInputOutputOpened: (state, payload: boolean) => {
      state.inputOutputOpened = payload
      return state
    },
    setSettingsView: (state, payload: SettingsViewType) => {
      state.settingsView = payload
    },
    toggleSideViewVisible: (state, payload: boolean) => {
      state.sideViewIsVisible = payload
    },
    toggleConferenceList: (state, payload: boolean) => {
      state.isConferenceList = payload
    },
    toggleAvoidToShow: (state, payload: boolean) => {
      state.avoidToShow = payload
    },
    resetSettingsView: (state) => {
      state.settingsView = 'main'
    },
    setFullScreen: (state, payload: boolean) => {
      return {
        ...state,
        isFullScreen: payload,
      }
    },
  },
  effects: (dispatch) => ({
    handleToggleIsOpen: (_: void, rootState) => {
      if (
        rootState.island.isOpen &&
        rootState.alerts.status.activeAlertsCount > 0 &&
        !rootState.currentCall.displayName
      ) {
        eventDispatch('phone-island-expanded', {})
        dispatch.island.toggleIsOpen(true)
      } else {
        eventDispatch('phone-island-' + (rootState.island.isOpen ? 'compressed' : 'expanded'), {})
        if (rootState.island.isOpen) {
          eventDispatch('phone-island-sideview-close', {})
        }
        dispatch.island.toggleIsOpen(!rootState.island.isOpen)
      }
    },
  }),
})

type IslandViewType =
  | 'call'
  | 'keypad'
  | 'player'
  | 'transfer'
  | 'recorder'
  | 'physicalPhoneRecorder'
  | 'settings'
  | 'video'
  | 'screenShare'
  | 'conference'
  | 'switchDevice'
  | 'waitingConference'
type SettingsViewType = 'microphone' | 'audioInput' | 'videoInput' | 'theme' | 'main'

interface IslandTypes {
  view?: IslandViewType | null
  isOpen: boolean
  actionsExpanded: boolean
  startPosition: {
    x: number
    y: number
  }
  inputOutputOpened: boolean
  settingsView: string
  sideViewIsVisible: boolean
  isConferenceList: boolean
  previousView?: IslandViewType | null
  avoidToShow?: boolean
  isFullScreen: boolean
}
