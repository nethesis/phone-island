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
  joinTime?: number
}

export interface ConferenceStoreTypes {
  usersList: Record<string, ConferenceUser> | null
  ownerInformations: ConferenceUser | null
  isActive: boolean
  conferenceStartedFrom: string
  conferenceStartTime: any
  isOwnerInside?: boolean
  isConferenceMuted: boolean
  conferenceId: string
}

const defaultState: ConferenceStoreTypes = {
  usersList: null,
  ownerInformations: null,
  isActive: false,
  conferenceStartedFrom: '',
  conferenceStartTime: null,
  isOwnerInside: false,
  isConferenceMuted: false,
  conferenceId: '',
}

export const conference = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateConferenceUsersList: (state, payload: Record<string, ConferenceUser>) => {
      // Search for the owner
      let owner: ConferenceUser | null = null

      // Determine if the conference is active
      const isActive = !!payload && Object.keys(payload).length > 0

      // Prepare updated user list with join timestamps
      let updatedUsersList: Record<string, ConferenceUser> = {}

      if (payload) {
        const currentTime = Date.now()

        // Process each user in the payload
        Object.entries(payload).forEach(([userId, user]) => {
          // Check if this user already exists in the current usersList
          const existingUser = state.usersList?.[userId]

          // Preserve existing user data: joinTime and muted status
          updatedUsersList[userId] = {
            ...user,
            joinTime: existingUser?.joinTime || currentTime,
            // Keep existing muted status if user already exists
            muted: existingUser ? existingUser.muted : user.muted,
          }

          // Find the owner
          if (user.owner) {
            owner = {
              ...user,
              joinTime: existingUser?.joinTime || currentTime,
              // Keep existing muted status for owner if it exists
              muted: existingUser ? existingUser.muted : user.muted,
            }
          }
        })
      }

      // Update the start time if the conference is becoming active and wasn't before
      const conferenceStartTime =
        !state.isActive && isActive ? Date.now() : state.conferenceStartTime

      return {
        ...state,
        usersList: updatedUsersList,
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
    setConferenceStartedFrom: (state, conferenceStartedFrom: string) => {
      return {
        ...state,
        conferenceStartedFrom,
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
    toggleIsOwnerInside: (state, isOwnerInside: boolean) => {
      return {
        ...state,
        isOwnerInside,
      }
    },
    toggleIsConferenceMuted: (state, isConferenceMuted: boolean) => {
      return {
        ...state,
        isConferenceMuted,
      }
    },
    updateConferenceId: (state, conferenceId: string) => {
      return {
        ...state,
        conferenceId,
      }
    },
    resetConference: () => defaultState,
  },
})
