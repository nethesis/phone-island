// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

export interface ConferenceUser {
  id: string
  name: string
  owner: boolean
  muted: boolean
  extenId: string
}

export interface ConferenceStoreTypes {
  usersList: Record<string, ConferenceUser> | null
  ownerInformations: ConferenceUser | null
  isActive: boolean
  conferenceStartTime: any
}

const defaultState: ConferenceStoreTypes = {
  usersList: null,
  ownerInformations: null,
  isActive: false,
  conferenceStartTime: null,
}

export const conference = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateConferenceUsersList: (state, payload: Record<string, ConferenceUser>) => {
      // Search for the owner
      let owner: ConferenceUser | null = null

      if (payload) {
        Object.values(payload).forEach((user) => {
          if (user.owner) {
            owner = user
          }
        })
      }

      // Determine if the conference is active
      const isActive = !!payload && Object.keys(payload).length > 0

      // Update the start time if the conference is becoming active and wasn't before
      const conferenceStartTime =
        !state.isActive && isActive ? Date.now() : state.conferenceStartTime

      return {
        ...state,
        usersList: payload,
        ownerInformations: owner,
        isActive: isActive,
        conferenceStartTime: isActive ? conferenceStartTime : null,
      }
    },
    updateOwnerInformations: (state, payload: ConferenceUser | null) => {
      return {
        ...state,
        ownerInformations: payload,
      }
    },
    setConferenceActive: (state, isActive: boolean) => {
      return {
        ...state,
        isActive,
        conferenceStartTime:
          isActive && !state.conferenceStartTime ? Date.now() : state.conferenceStartTime,
      }
    },
    resetTimer: (state) => {
      return {
        ...state,
        conferenceStartTime: Date.now(),
      }
    },
    resetFirstUserFlag: (state) => {
      return {
        ...state,
        isFirstUser: false,
      }
    },
    toggleUserMuted: (state, payload: { extenId: string; muted?: boolean }) => {
      const { extenId, muted } = payload

      if (!state.usersList || !state.usersList[extenId]) {
        return state
      }

      const updatedUsersList = { ...state.usersList }

      updatedUsersList[extenId] = {
        ...updatedUsersList[extenId],
        muted: muted !== undefined ? muted : !updatedUsersList[extenId].muted,
      }

      let updatedOwnerInformations = state.ownerInformations
      if (state.ownerInformations && state.ownerInformations.extenId === extenId) {
        updatedOwnerInformations = {
          ...state.ownerInformations,
          muted: updatedUsersList[extenId].muted,
        }
      }

      return {
        ...state,
        usersList: updatedUsersList,
        ownerInformations: updatedOwnerInformations,
      }
    },
    resetConference: () => defaultState,
  },
})
