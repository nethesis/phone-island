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
  contactListView: 'main',
  sideViewIsVisible: false,
  isConferenceList: false,
  previousView: null,
  avoidToShow: false,
  isFullScreen: false,
}

export const island = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setIslandView: (state, newView: IslandViewType | null) => {
      if (newView === state?.view) {
        // Don't change view if it's the same
        return state
      } else {
        return {
          ...state,
          view: newView,
          previousView: state?.view,
        }
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
    setContactListView: (state, payload: ContactListViewType) => {
      state.contactListView = payload
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
    resetPlayerClose: (state) => {
      return getResetState(state, false)
    },
    resetIslandStore: (state) => {
      return getResetState(state, true)
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

function getResetState(state: IslandTypes, includeRecorder: boolean): IslandTypes {
  // Keep beginning position
  const preservedStartPosition = state.startPosition
  // Determine which view to preserve
  const viewsToPreserve = ['waitingConference']
  if (includeRecorder) {
    viewsToPreserve.push('recorder')
  }

  const preservedView = viewsToPreserve.includes(state.view as string)
    ? state.view
    : defaultState.view
  const avoidToShow = state.avoidToShow

  return {
    ...defaultState,
    startPosition: preservedStartPosition,
    view: preservedView,
    avoidToShow: avoidToShow,
    // Keep previousView if waitingConference
    previousView:
      state.view === 'waitingConference' ? state.previousView : defaultState.previousView,
  }
}

type IslandViewType =
  | 'call'
  | 'keypad'
  | 'player'
  | 'transfer'
  | 'recorder'
  | 'physicalPhoneRecorder'
  | 'settings'
  | 'video'
  | 'conference'
  | 'switchDevice'
  | 'waitingConference'
type SettingsViewType = 'microphone' | 'audioInput' | 'videoInput' | 'theme' | 'main'
type ContactListViewType = 'main' | 'selectContactNumber'

interface IslandTypes {
  view?: IslandViewType | null
  isOpen: boolean
  actionsExpanded: boolean
  startPosition: {
    x: number
    y: number
  }
  inputOutputOpened: boolean
  settingsView: SettingsViewType
  contactListView: ContactListViewType
  sideViewIsVisible: boolean
  isConferenceList: boolean
  previousView?: IslandViewType | null
  avoidToShow?: boolean
  isFullScreen: boolean
}
