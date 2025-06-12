// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Checks if back call view is active
 */
export function isBackCallActive() {
  const { view, isOpen }: any = store.getState().island
  const { transferring } = store.getState().currentCall
  const { isActive, usersList, conferenceStartedFrom } = store.getState().conference
  const { name, username } = store.getState().currentUser

  const isUserInConference =
    usersList && Object.values(usersList).some((user: any) => user.name === name)

  return (
    ['keypad', 'transfer', 'settings', 'switchDevice', 'streamingAnswer'].includes(view) ||
    (view === 'video' && isOpen) ||
    transferring ||
    //check if conference is active
    (isActive &&
      view !== 'waitingConference' &&
      (isUserInConference || conferenceStartedFrom === username) &&
      isOpen)
  )
}
