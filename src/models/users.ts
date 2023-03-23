// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type { ExtensionsTypes, ExtensionTypes, UsersEndpointsTypes } from '../types'

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
    updateEndpoints: (state, payload: any) => {
      // !TODO adds the type for endpoints
      return {
        ...state,
        endpoints: payload,
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
  },
})

interface UsersTypes {
  extensions: ExtensionsTypes | null
  endpoints: UsersEndpointsTypes | null
}
