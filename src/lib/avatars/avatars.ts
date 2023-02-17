// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { AvatarsTypes } from '../../types'
import { store } from '../../store'
import { loadCache, saveCache } from '../storage/local_storage'
import { getAllAvatars } from '../../services/user'

export const AVATARS_EXPIRATION_MILLIS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Get avatars from localstorage or request it from the api
 * ... other applications like nethvoice-cti could use or
 * ... request an avatars object
 *
 * @param username The username of the current user
 */
export async function retrieveAvatars(username: string) {
  try {
    let avatars: AvatarsTypes | undefined = loadCache('operatorsAvatars', username)
    if (avatars && Object.values(avatars).length > 0) {
      // Avatars already are in localstorage
      store.dispatch.avatars.updateAvatars(avatars)
    } else {
      // Request avatars to the API
      const avatarsResponse: AvatarsTypes | undefined = await getAllAvatars()
      if (avatarsResponse && Object.values(avatarsResponse).length > 0) {
        const expiration: number = new Date().getTime() + AVATARS_EXPIRATION_MILLIS
        // Update avatars in localstorage for performances and for other applications
        saveCache('operatorsAvatars', avatarsResponse, username, expiration)
        // Update avatars store
        store.dispatch.avatars.updateAvatars(avatarsResponse)
      }
    }
  } catch (error) {}
}
