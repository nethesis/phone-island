// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

export function destroyScreenShareRoom(plugin: any, room: string) {
  const detach = () => plugin.detach()
  plugin.send({ message: { request: 'destroy', room }, success: detach, error: detach })
}

export function releaseScreenShareHandles(destroyRoom: boolean) {
  const { plugin, remoteFeed, room } = store.getState().screenShare
  store.dispatch.screenShare.update({ plugin: null, remoteFeed: null, room: '' })
  remoteFeed?.detach()
  if (!plugin) return
  if (!destroyRoom) {
    plugin.detach()
    return
  }
  if (room) destroyScreenShareRoom(plugin, room)
}
