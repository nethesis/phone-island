// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { eventDispatch } from '../utils'
import type {
  MainPresenceTypes,
  MainPresenceEventTypes,
  ExtensionTypes,
  ConversationsEventType,
  QueuesUpdateTypes,
  QueuesEventType,
  QueueUpdateMemberTypes,
  QueuesMemberEventType,
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

/**
 * The dispatch function for the queueUpdate event
 *
 * @param event The queueUpdate event from socket
 */
export function dispatchQueueUpdate(event: QueuesUpdateTypes) {
  const data: QueuesEventType = {
    [event.queue]: event,
  }
  // Dispatch the event on window for external handlers
  eventDispatch('phone-island-queue-update', data)
}

/**
 * The dispatch function for the queueMemberUpdate event
 *
 * @param event The queueMemberUpdate event from socket
 */
export function dispatchQueueMemberUpdate(event: QueueUpdateMemberTypes) {
  const data: QueuesMemberEventType = {
    [event.member]: event,
  }
  // Dispatch the event on window for external handlers
  eventDispatch('phone-island-queue-member-update', data)
}

/**
 * The dispatch function for the takeOver event
 *
 * @param event The takeOver event from socket
 */
export function dispatchAlreadyLogin() {
  // Dispatch the event on window for external handlers
  eventDispatch('phone-island-user-already-login', {})
}
