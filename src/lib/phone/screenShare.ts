// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'
import type { RootState } from '../../store'

export type ScreenShareRoomCreation = 'direct' | 'middleware'

export type ScreenShareCall = Pick<
  RootState['currentCall'],
  'conversationId' | 'username' | 'number' | 'ownerExtension'
>

export function isScreenShareCallCurrent(call: ScreenShareCall) {
  const current = store.getState().currentCall
  return (
    current.accepted &&
    !current.transferring &&
    !current.transferSwitching &&
    current.conversationId === call.conversationId &&
    current.username === call.username &&
    current.number === call.number &&
    current.ownerExtension === call.ownerExtension
  )
}

export function destroyScreenShareRoom(plugin: any, room: string | number) {
  const detach = () => plugin.detach()
  plugin.send({ message: { request: 'destroy', room }, success: detach, error: detach })
}

export function releaseScreenShareHandles(destroyRoom: boolean, keepCreatingHandle = true) {
  const { plugin, remoteFeed, room } = store.getState().screenShare
  store.dispatch.screenShare.update({ plugin: null, remoteFeed: null, room: '' })
  remoteFeed?.detach()
  if (!plugin) return
  if (destroyRoom && room) {
    destroyScreenShareRoom(plugin, room)
  } else if (!destroyRoom || !keepCreatingHandle) {
    plugin.detach()
  }
}
