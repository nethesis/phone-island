// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'
import { ExtensionsTypes, TransferTypes } from '../types'
import { useSelector } from 'react-redux'

/**
 * Get all extensions
 */
export async function getAllExtensions(): Promise<ExtensionsTypes> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/extensions`, {
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
 * Start blind transfer
 */
export async function blindTransfer(body: TransferTypes) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/blindtransfer`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Start attended transfer
 */
export async function attendedTransfer(body: TransferTypes) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/atxfer`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Hangup a conversation
 */
export async function hangupConversation(body: { convid: string; endpointId: string }) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/hangup`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function parkConversation(body: {
  applicantId: string // Current user main extension
  convid: string
  endpointId: string // Current user main extension
}) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/park`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function answerPhysical() {
  // get data
  const { default_device } = store.getState().currentUser

  // compose body
  let body: any = {
    endpointId: default_device?.id,
    endpointType: 'extension',
  }

  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/answer`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function hangupPhysical() {
  // get data
  const { ownerExtension, conversationId } = store.getState().currentCall
  const currentUserInformation = store.getState().currentUser
  // compose body
  let body: any = {
    convid: conversationId,
    endpointId: ownerExtension,
    endpointType: 'extension',
  }
  let astproxyUrl = '/astproxy/'
  let actionUrl = ''
  if (body?.convid !== '' && body?.convid !== undefined) {
    actionUrl = 'hangup'
  } else {
    actionUrl = 'cancel'
    // set user default device as endpointId on cancel action
    body.endpointId = currentUserInformation?.default_device?.id
  }
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    // if default device is physical check if conversation is empty or not
    // if conversation is empty then cancel the call else hangup the call
    const response = await fetch(`${baseURL}` + `${astproxyUrl}` + `${actionUrl}`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function hangupPhysicalRecordingCall() {
  // get data
  const { ownerExtension, conversationId } = store.getState().physicalRecorder
  // compose body
  let body: any = {
    convid: conversationId,
    endpointId: ownerExtension,
    endpointType: 'extension',
  }

  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/hangup`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function mutePhysical(toggleMute: boolean) {
  // get data
  const { ownerExtension, conversationId } = store.getState().currentCall

  // compose body
  let body: any = {
    convid: conversationId,
    endpointId: ownerExtension,
  }

  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/toggle_mute`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    store.dispatch.currentCall.updateCurrentCall({
      muted: toggleMute,
    })
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function pausePhysical(togglePause: boolean) {
  // get data
  const { ownerExtension, conversationId } = store.getState().currentCall

  // compose body
  let body: any = {
    endpointId: ownerExtension,
  }

  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/toggle_hold`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    store.dispatch.currentCall.updateCurrentCall({
      paused: togglePause,
    })
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function sendPhysicalDTMF(key: string) {
  // get data
  const { ownerExtension, conversationId } = store.getState().currentCall

  // compose body
  let body: any = {
    convid: conversationId,
    endpointId: ownerExtension,
    tone: key.toString(),
  }

  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/dtmf`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function callPhysical(to: string) {
  // get data
  const { ownerExtension } = store.getState().currentCall

  // compose body
  let body: any = {
    endpointId: ownerExtension,
    endpointTpe: 'extension',
    number: to,
  }

  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/call`, {
      method: 'POST',
      headers: { ...headers },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return true
  } catch (error: any) {
    throw new Error(error)
  }
}

export async function toggleRecord(recordingType: any, obj: any) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/astproxy/${recordingType}`, {
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
