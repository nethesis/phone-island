// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'

export async function createScreenShareRoom(conversationId: string, signal: AbortSignal) {
  const { apiMode, baseURL, headers } = store.getState().fetchDefaults
  if (apiMode !== 'new' || !baseURL || !headers?.Authorization?.startsWith('Bearer ')) {
    throw new Error('Screen sharing requires the middleware API')
  }

  const response = await fetch(`${baseURL}/screen-sharing/rooms`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversationId }),
    redirect: 'error',
    signal,
  })
  if (response.status !== 201) {
    throw new Error('Cannot create screen sharing room')
  }

  const result = await response.json()
  const room = result?.room
  if (typeof room !== 'number' || !Number.isSafeInteger(room) || room <= 0) {
    throw new Error('Invalid screen sharing room')
  }
  return room
}
