// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'
import { CurrentCallTypes } from '../models/currentCall'

/**
 * Custom hook returning the currentCall store
 * @returns The currentUser store values
 */
export const useCurrentCallStore = (): CurrentCallTypes => {
  return {
    ...store.getState().currentCall,
  }
}
