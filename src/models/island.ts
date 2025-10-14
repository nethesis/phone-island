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
  transcriptionViewIsVisible: false,
  isConferenceList: false,
  previousView: null,
  avoidToShow: false,
  isFullScreen: false,
  isFromStreaming: false,
  isExtraLarge: false,
  urlOpened: false,
  previewCallFromMobileOrNethlink: false,
  operatorBusy: {
    isActive: false,
    calledNumber: null,
    callerNumber: null,
  },
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
    toggleTranscriptionViewVisible: (state, payload: boolean) => {
      state.transcriptionViewIsVisible = payload
    },
    toggleConferenceList: (state, payload: boolean) => {
      state.isConferenceList = payload
    },
    toggleAvoidToShow: (state, payload: boolean) => {
      state.avoidToShow = payload
    },
    setUrlOpened: (state, payload: boolean) => {
      state.urlOpened = payload
      return state
    },
    setPreviewCallFromMobileOrNethlink: (state, payload: boolean) => {
      state.previewCallFromMobileOrNethlink = payload
      return state
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
    setIsFromStreaming: (state, payload: boolean) => {
      return {
        ...state,
        isFromStreaming: payload,
      }
    },
    setExtraLarge: (state, payload: boolean) => {
      return {
        ...state,
        isExtraLarge: payload,
      }
    },
    resetPlayerClose: (state) => {
      return getResetState(state, false)
    },
    resetIslandStore: (state) => {
      return getResetState(state, true)
    },
    _resetIslandStoreInternal: (state) => {
      return getResetState(state, true)
    },
    _resetPlayerCloseInternal: (state) => {
      return getResetState(state, false)
    },
    setOperatorBusyCalledNumber: (state, payload: string) => {
      state.operatorBusy.calledNumber = payload
      return state
    },
    setOperatorBusyActive: (state, payload: { callerNumber: string }) => {
      state.operatorBusy.isActive = true
      state.operatorBusy.callerNumber = payload.callerNumber
      return state
    },
    resetOperatorBusy: (state) => {
      state.operatorBusy.isActive = false
      state.operatorBusy.callerNumber = null
      // Keep calledNumber for potential reuse
      return state
    },
    resetOperatorBusyCompletely: (state) => {
      state.operatorBusy.isActive = false
      state.operatorBusy.calledNumber = null
      state.operatorBusy.callerNumber = null
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
        eventDispatch('phone-island-expanded', {})
        dispatch.island.toggleIsOpen(true)
      } else {
        eventDispatch('phone-island-' + (rootState.island.isOpen ? 'compressed' : 'expanded'), {})
        if (rootState.island.isOpen) {
          eventDispatch('phone-island-sideview-close', {})
          eventDispatch('phone-island-transcription-close', {})
        }
        dispatch.island.toggleIsOpen(!rootState.island.isOpen)
      }
    },
    handleResetIslandStore: () => {
      dispatch.island._resetIslandStoreInternal()
      eventDispatch('phone-island-transcription-close', {})
    },
    handleResetPlayerClose: () => {
      dispatch.island._resetPlayerCloseInternal()
      eventDispatch('phone-island-transcription-close', {})
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
    isFromStreaming: false,
    previewCallFromMobileOrNethlink: false,
    // Keep previousView if waitingConference
    previousView:
      state.view === 'waitingConference' ? state.previousView : defaultState.previousView,
    // Preserve calledNumber for potential operator busy scenarios
    operatorBusy: {
      isActive: false,
      calledNumber: state.operatorBusy.calledNumber,
      callerNumber: null,
    },
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
  | 'streamingAnswer'
  | 'operatorBusy'
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
  transcriptionViewIsVisible: boolean
  isConferenceList: boolean
  previousView?: IslandViewType | null
  avoidToShow?: boolean
  isFullScreen: boolean
  isFromStreaming: boolean
  isExtraLarge: boolean
  urlOpened: boolean
  previewCallFromMobileOrNethlink: boolean
  operatorBusy: {
    isActive: boolean
    calledNumber: string | null
    callerNumber: string | null
  }
}
