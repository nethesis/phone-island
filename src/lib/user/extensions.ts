// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { UserExtensionTypes } from '../../types'
import { store } from '../../store'
import { ExtensionTypes } from '../../types'

/**
 * Retrive the webrtc extensions for currentUser extensions
 *
 * @returns An extension object, an array of extension objects or null
 */
export function getWebrtcExtensions(): UserExtensionTypes | UserExtensionTypes[] | null {
  // Get endpoints currentUser store
  const { endpoints } = store.getState().currentUser
  if (endpoints?.extension && endpoints.extension.length > 0) {
    const webrtcExtensions = endpoints?.extension.filter((extension) => extension?.type === 'webrtc' || extension?.type === 'nethlink')
    return webrtcExtensions.length === 1
      ? webrtcExtensions[0]
      : webrtcExtensions.length > 1
      ? webrtcExtensions
      : null
  }
  return null
}

/**
 * Retrieve the data of the id extension passed as parameter
 *
 * @param id The extension id
 * @return The extension data with conversations
 */
export function getExtensionData(id: string): ExtensionTypes | null {
  const { extensions } = store.getState().users
  return extensions && extensions[id] ? extensions[id] : null
}

/**
 * Checks if all the extensions are free
 */
export function userTotallyFree() {
  const { extensions } = store.getState().users
  const { endpoints } = store.getState().currentUser
  // Check all extensions for conversations
  if (extensions && endpoints) {
    for (const extension of endpoints.extension) {
      if (extensions[extension.id] && extensions[extension.id].conversations) {
        if (Object.keys(extensions[extension.id].conversations).length > 0) {
          return false
        }
      }
    }
  }
  return true
}

/**
 * Retrieve the list of the extensions of the current user
 */
export function getExtensionsList(): string[] {
  const { endpoints } = store.getState().currentUser
  return endpoints?.extension.map((extension) => extension.id) || []
}
