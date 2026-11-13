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

/**
 * Error of a streaming request, with the HTTP status and the error code returned by the server
 * (for example "gate_timeout"), when available
 */
export class StreamingRequestError extends Error {
  status?: number
  code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'StreamingRequestError'
    this.status = status
    this.code = code
    // keep instanceof working with the ES5 build target
    Object.setPrototypeOf(this, StreamingRequestError.prototype)
  }
}

const streamingRequestError = async (response: Response) => {
  let code: string | undefined
  let message = response.statusText
  try {
    const body = await response.json()
    code = typeof body?.code === 'string' ? body.code : undefined
    message = body?.message || code || message
  } catch {
    // not JSON
  }
  return new StreamingRequestError(message, response.status, code)
}

/**
 * Opens a gate of a video source. Without a gate the server opens the first one.
 *
 * @param obj.id the video source id
 * @param obj.gate the gate id (optional)
 */
export async function openVideoSource(obj: { id: string; gate?: string } | any) {
  const { baseURL, headers } = store.getState().fetchDefaults
  const response = await fetch(`${baseURL}/streaming/open`, {
    method: 'POST',
    headers: { ...headers },
    body: JSON.stringify(obj),
  })
  if (!response.ok) {
    throw await streamingRequestError(response)
  }
  return true
}

export interface StreamingTokenType {
  token: string
  // seconds
  expires_in: number
  // WHEP path of the video gateway
  whep: string
}

/**
 * Gets a short-lived token to watch the live video of an "rtsp" video source
 */
export async function getStreamingToken(id: string): Promise<StreamingTokenType> {
  const { baseURL, headers } = store.getState().fetchDefaults
  const response = await fetch(`${baseURL}/streaming/token`, {
    method: 'POST',
    headers: { ...headers },
    body: JSON.stringify({ id }),
  })
  if (!response.ok) {
    throw await streamingRequestError(response)
  }
  return response.json()
}

/**
 * Absolute URL of a WHEP path of the video gateway. The gateway is published on the CTI host,
 * which is the host of the REST API (the page origin differs when embedded, e.g. in NethLink).
 */
export function getWhepUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const { baseURL } = store.getState().fetchDefaults
  const base = baseURL ? new URL(baseURL, window.location.href).origin : window.location.origin
  return new URL(path, base + '/').toString()
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
 * Check if a call summary/transcription exists for a given uniqueid.
 * Resolves (returns void) when the summary exists (HTTP 200).
 * Throws:
 *   - Error with status 204 when the summary is not ready yet.
 *   - Error with the corresponding HTTP status code for any other non-200 response
 *     (including, but not limited to, 401, 403, 404, 503).
 */
export async function checkSummaryCall(uniqueid: string, linkedid?: string): Promise<void> {
  const { baseURL, headers } = store.getState().fetchDefaults
  const queryString = linkedid ? `?linkedid=${encodeURIComponent(linkedid)}` : ''
  const url = `${baseURL}/summary/${uniqueid}${queryString}`
  const response = await fetch(url, {
    method: 'HEAD',
    headers: { ...headers },
  })

  // 200 - Summary exists
  if (response.status === 200) {
    return
  }

  // 204 - Summary not present yet (not an error, just not ready)
  if (response.status === 204) {
    const error: any = new Error('Summary not ready')
    error.status = 204
    throw error
  }

  // 401, 403, 404, 503 - Real errors
  const error: any = new Error(`Failed to check summary: ${response.statusText}`)
  error.status = response.status
  throw error
}

/**
 * Watch for call summary/transcription for a given linkedid and uniqueid.
 * If uniqueid differs from linkedid (e.g. queue call), both are sent.
 */
export async function watchSummaryCall(linkedid: string, uniqueid: string): Promise<void> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const url = `${baseURL}/summary/watch`
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify({ linkedid, uniqueid }),
    })
    if (!response.ok) {
      throw new Error(`Failed to watch summary call: ${response.status} ${response.statusText}`)
    }
  } catch (error: any) {
    console.error('Error watching summary call:', error)
    throw error
  }
}
