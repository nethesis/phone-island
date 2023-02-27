// Copyright (C) 2022 Nethesis S.r.l.
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
    const webrtcExtensions = endpoints?.extension.filter((extension) => extension.type === 'webrtc')
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
