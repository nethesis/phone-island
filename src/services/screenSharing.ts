// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'

export async function fetchVideoRoomAdminKey(signal: AbortSignal) {
  const { baseURL, headers } = store.getState().fetchDefaults
  if (!baseURL || !headers?.Authorization) {
    throw new Error('Screen sharing credentials are unavailable')
  }

  const response = await fetch(`${baseURL}/user/janus_admin_key`, {
    headers,
    cache: 'no-store',
    redirect: 'error',
    signal,
  })
  // Servers from before VideoRoom enforcement do not provide a key.
  if (response.status === 404) return
  if (response.status !== 200) throw new Error('Screen sharing credentials are unavailable')

  const key = (await response.json())?.admin_key
  if (typeof key !== 'string' || !/^[A-Za-z0-9]+$/.test(key)) {
    throw new Error('Invalid screen sharing credentials')
  }
  return key
}
