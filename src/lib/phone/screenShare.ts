// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

// Secret for a screen sharing room: only its publisher can destroy or edit it.
export function createScreenShareRoomSecret() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function destroyScreenShareRoom(plugin: any, room: string, secret?: string) {
  const detach = () => plugin.detach()
  plugin.send({
    message: { request: 'destroy', room, ...(secret && { secret }) },
    success: detach,
    error: detach,
  })
}

export function releaseScreenShareHandles(destroyRoom: boolean) {
  const { plugin, remoteFeed, room, roomSecret } = store.getState().screenShare
  store.dispatch.screenShare.update({ plugin: null, remoteFeed: null, room: '', roomSecret: '' })
  remoteFeed?.detach()
  if (!plugin) return
  if (!destroyRoom) {
    plugin.detach()
    return
  }
  if (room) destroyScreenShareRoom(plugin, room, roomSecret)
}
