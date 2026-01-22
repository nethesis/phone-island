// Copyright (C) 2024 Nethesis S.r.l.
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

export async function setDefaultDevice(
  default_type: string,
  extensionNumber: string,
): Promise<any> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults

    let webrtcId: any = { id: extensionNumber }
    let physicalId: any = { id: extensionNumber }
    const response = await fetch(`${baseURL}/user/default_device`, {
      method: 'POST',
      headers: { ...headers },
      body: default_type === 'physical' ? JSON.stringify(physicalId) : JSON.stringify(webrtcId),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
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

export async function changeOperatorStatus(obj: any) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/user/presence`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(obj),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw error
  }
}

export async function changeDefaultDevice(obj: any) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/user/default_device`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(obj),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw error
  }
}

export async function setMainDevice(obj: any) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/user/default_device`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(obj),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw error
  }
}

/**
 * Get parameter URL information
 */
export async function getParamUrl(): Promise<UserInfoTypes | undefined> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/user/paramurl`, {
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

export async function getVideoSources(): Promise<UserInfoTypes | undefined> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/streaming/sources`, {
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

export async function openVideoSource(obj: any) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/streaming/open`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(obj),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw error
  }
}

export async function subscribe(obj: any) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/streaming/subscribe`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(obj),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw error
  }
}

export async function unsubscribe(obj: any) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/streaming/unsubscribe`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(obj),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw error
  }
}

export async function setIncomingCallsPreference(settingsStatus: any) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/user/settings`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(settingsStatus),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      return text ? JSON.parse(text) : {}
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error updating user settings:', error)
    throw error
  }
}

/**
 * Get feature codes
 */
export async function getFeatureCodes(): Promise<any> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/feature_codes`, {
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
 * Check if a call summary/transcription exists for a given extension ID
 */
export async function checkSummaryCall(extensionId: string): Promise<boolean> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/api/summary_check/${extensionId}`, {
      headers: { ...headers },
    })
    return response.ok
  } catch (error: any) {
    console.error('Error checking summary call:', error)
    return false
  }
}
