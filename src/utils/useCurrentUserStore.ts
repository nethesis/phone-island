// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'
import type { UserInfoTypes } from '../services/user'

/**
 * Custom hook returning the currentUser store
 * @returns The currentUser store values
 */
export const useCurrentUserStore = (): UserInfoTypes => {
  return {
    ...store.getState().currentUser,
  }
}
