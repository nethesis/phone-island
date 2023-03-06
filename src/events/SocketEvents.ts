// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { eventDispatch } from '../utils'
import type {
  MainPresenceTypes,
  MainPresenceEventTypes,
  ExtensionTypes,
  ConversationsEventType,
} from '../types'

/**
 * The dispatch function for the userMainPresenceUpdate event
 *
 * @param event The userMainPresenceUpdate event from socket
 */
export function dispatchMainPresence(event: MainPresenceTypes) {
  const data: MainPresenceEventTypes = {
    [event.mainPresence.username]: {
      mainPresence: event.mainPresence.status,
    },
  }
  eventDispatch('phone-island-main-presence', data)
}

/**
 * The dispatch function for the extenUpdate event
 *
 * @param event The extenUpdate event from socket
 */
export function dispatchConversations(event: ExtensionTypes) {
  const data: ConversationsEventType = {
    [event.username]: {
      conversations: event.conversations,
    },
  }
  // Dispatch the event on window for external handlers
  eventDispatch('phone-island-conversations', data)
}

// phone-island-queue-update
