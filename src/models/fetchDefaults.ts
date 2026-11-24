// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: FetchTypes = {
  baseURL: '',
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json;charset=UTF-8',
  },
  fetchReady: false,
  apiMode: 'new',
}

export const fetchDefaults = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateFetchBaseURL: (state, payload: string) => {
      return {
        ...state,
        baseURL: payload,
      }
    },
    updateFetchHeaders: (state, payload: HeadersTypes) => {
      return {
        ...state,
        headers: {
          ...state.headers,
          ...payload,
        },
      }
    },
    setApiMode: (state, payload: 'new' | 'legacy') => {
      return {
        ...state,
        apiMode: payload,
      }
    },
    setFetchReady: (state) => {
      return {
        ...state,
        fetchReady: true,
      }
    },
  },
})

interface HeadersTypes {
  [key: string]: string
}

interface FetchTypes {
  baseURL?: string
  headers?: HeadersTypes
  fetchReady?: boolean
  apiMode: 'new' | 'legacy'
}
