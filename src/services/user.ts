// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'
import type { UserInfoTypes, AvatarsTypes, UsersEndpointsTypes } from '../types'

/**
 * Get current user info
 */
export async function getCurrentUserInfo(): Promise<UserInfoTypes | undefined> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/user/me`, {
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

/**
 * Get all avatars
 */
export async function getAllAvatars(): Promise<AvatarsTypes | undefined> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults

    const response = await fetch(`${baseURL}/user/all_avatars`, {
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

/**
 * Get all users endpoints
 */
export async function getAllUsersEndpoints(): Promise<UsersEndpointsTypes | undefined> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/user/endpoints/all`, {
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
