// Copyright (C) 2024 Nethesis S.r.l.
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
export function dispatchExtensions(event: ExtensionTypes) {
  const data: any = {
    [event.username]: {
      conversations: event?.conversations,
      status: event?.status,
      sipuseragent: event?.sipuseragent,
      username: event?.username,
      port: event?.port,
      dnd: event?.dnd,
      number: event?.exten,
      ip: event?.ip,
      exten: event?.exten,
      name: event?.name,
    },
  }
  // Dispatch the event on window for external handlers
  eventDispatch('phone-island-extensions-update', data)
}

/**
 * The dispatch function for the extenUpdate event
 *
 * @param event The extenUpdate event from socket
 */
export function dispatchConversations(event: ExtensionTypes) {
  const data: any = {
    [event.username]: {
      conversations: event?.conversations,
      status: event?.status,
      sipuseragent: event?.sipuseragent,
      username: event?.username,
      port: event?.port,
      dnd: event?.dnd,
      number: event?.exten,
      ip: event?.ip,
      exten: event?.exten,
      name: event?.name,
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

/**
 * The dispatch function for server reload
 *
 * @param event The serverReload event from socket
 */
export function dispatchServerReload() {
  // Dispatch the event on window for external handlers
  eventDispatch('phone-island-server-reloaded', {})
}

/**
 * The dispatch function for parking update
 *
 * @param event The parking update event from socket
 */
export function dispatchParkingUpdate() {
  // Dispatch the event on window for external handlers
  eventDispatch('phone-island-parking-update', {})
}

/**
 * The dispatch function for url physical call
 *
 * @param event The parking update event from socket
 */
export function dispatchUrlCall(url: string, urlType: string) {
  // Dispatch the event on window for external handlers
  let urlCallObject = {
    url: url,
    urlType: urlType,
  }
  eventDispatch('phone-island-action-physical', { urlCallObject })
}

/**
 * The dispatch function to update the default device
 *
 * @param extension The default_device_update event from socket
 */
export function dispatchDefaultDeviceUpdate(extension: string) {
  // Dispatch the event on window for external handlers
  eventDispatch('phone-island-default-device-updated', { id: extension })
}
