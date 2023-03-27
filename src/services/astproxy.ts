// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'
import { TransferTypes } from '../types'

/**
 * Get all extensions
 */
export async function getAllExtensions() {
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
