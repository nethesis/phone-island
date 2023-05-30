// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type { UserInfoTypes, ExtensionTypes, ConversationsTypes } from '../types'

const defaultState: CurrentUserTypes = {
  currentUserReady: false,
  conversations: {},
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
  },
})

interface CurrentUserTypes extends UserInfoTypes {
  currentUserReady: boolean
  conversations: UserConversationTypes
}

interface UserConversationTypes {
  [exten: string]: ConversationsTypes
}
