// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'

/**
 * Returns the file name of the voicemail
 * @param id Voicemail ID
 * @returns Promise resolving to filename
 */
export async function getVoicemailFileName(id: string): Promise<string> {
  if (!id) {
    throw new Error('Voicemail ID is required')
  }

  const { baseURL, headers } = store.getState().fetchDefaults

  try {
    const response = await fetch(`${baseURL}/voicemail/download/${id}`, {
      headers: { ...headers },
    })

    if (!response.ok) {
      throw new Error(`Failed to get voicemail filename: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching voicemail filename:', error)
    throw error
  }
}

/**
 * Returns the base64 audio content of the voicemail
 * @param id Voicemail ID
 * @returns Promise resolving to base64 audio data
 */
export async function getVoicemailBase64(id: string): Promise<string> {
  if (!id) {
    throw new Error('Voicemail ID is required')
  }

  const { baseURL, headers } = store.getState().fetchDefaults

  try {
    const response = await fetch(`${baseURL}/voicemail/listen/${id}`, {
      headers: { ...headers },
    })

    if (!response.ok) {
      throw new Error(`Failed to get voicemail audio: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching voicemail audio:', error)
    throw error
  }
}
