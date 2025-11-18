// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type { UserInfoTypes, ExtensionTypes, ConversationsTypes } from '../types'

const defaultState: CurrentUserTypes = {
  currentUserReady: false,
  conversations: {},
  featureCodes: null,
}

export const currentUser = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateCurrentUser: (state, payload: UserInfoTypes) => {
      return {
        ...state,
        ...payload,
      }
    },
    updateMainPresence: (state, payload) => {
      state.mainPresence = payload
    },
    updateCurrentDefaultDevice: (state, payload) => {
      state.default_device = payload
    },
    setCurrentUserReady: (state, payload: boolean) => {
      return {
        ...state,
        currentUserReady: payload,
      }
    },
    updateConversations: (state, payload: ExtensionTypes) => {
      // Update the conversatins of the exten
      state.conversations[payload.exten] = payload.conversations
      return state
    },
    updateFeatureCodes: (state, payload: any) => {
      state.featureCodes = payload
    },
  },
})

interface CurrentUserTypes extends UserInfoTypes {
  currentUserReady: boolean
  conversations: UserConversationTypes
  featureCodes: any
}

interface UserConversationTypes {
  [exten: string]: ConversationsTypes
}
