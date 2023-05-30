// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type {
  ExtensionsTypes,
  ExtensionTypes,
  UsersEndpointsTypes,
  UserEndpointsTypes,
} from '../types'

const defaultState: UsersTypes = {
  extensions: null,
  endpoints: null,
}

export const users = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateExtensions: (state, payload: ExtensionsTypes) => {
      return {
        ...state,
        extensions: payload,
      }
    },
    updateExtension: (state, payload: ExtensionTypes) => {
      return {
        ...state,
        extensions: {
          ...state.extensions,
          [payload.exten]: payload,
        },
      }
    },
    updateEndpoints: (state, payload: UsersEndpointsTypes) => {
      return {
        ...state,
        endpoints: payload,
      }
    },
    updateEndpoint: (state, payload: UserEndpointsTypes) => {
      return {
        ...state,
        endpoints: {
          ...state.endpoints,
          [payload.username]: payload,
        },
      }
    },
    updateEndpointMainPresence: (state, payload: { username: string; status: string }) => {
      if (state.endpoints) {
        const newEndpoint: UserEndpointsTypes = {
          ...state.endpoints[payload.username],
          mainPresence: payload.status,
        }
        // Return the state with the updated endpoint
        return {
          ...state,
          endpoints: {
            ...state.endpoints,
            [payload.username]: newEndpoint,
          },
        }
      }
    },
  },
})

interface UsersTypes {
  extensions: ExtensionsTypes | null // Useful for the conversations...
  endpoints: UsersEndpointsTypes | null // Useful for the main presence...
}
