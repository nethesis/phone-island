// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'
import type { UserInfoTypes, AvatarsTypes, UsersEndpointsTypes } from '../types'

/**
 * Get announcement in base64 format
 */
export async function getAnnouncement(id: string): Promise<string> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/offhour/listen_announcement/${id}`, {
      headers: { ...headers },
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = await response.json()
    return data
  } catch (error: any) {
    throw new Error(error)
  }
}
