// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState: RecorderTypes = {
  recording: false,
  waiting: false,
  incoming: false,
}

export const recorder = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setRecording: (state, payload: boolean) => {
      state.recording = payload
      return state
    },
    setWaiting: (state, payload: boolean) => {
      state.waiting = payload
      return state
    },
    setIncoming: (state, payload: boolean) => {
      state.incoming = payload
      return state
    },
  },
})

interface RecorderTypes {
  recording: boolean
  waiting: boolean
  incoming: boolean
}
