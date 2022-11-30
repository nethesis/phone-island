// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'
import { WebRTCTypes } from '../models/webrtc'

export const useWebRTCStore = (): WebRTCTypes => {
  return {
    ...store.getState().webrtc,
  }
}
