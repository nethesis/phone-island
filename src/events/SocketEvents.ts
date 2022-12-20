// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { eventDispatch } from '../utils'

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
export function dispatchConversations(event: ExtenUpdateTypes) {
  const data: ConversationsEventType = {
    [event.username]: {
      conversations: event.conversations,
    },
  }
  eventDispatch('phone-island-conversations', data)
}

interface MainPresenceEventTypes {
  [username: string]: {
    mainPresence: string
  }
}

interface ConversationsEventType {
  [username: string]: {
    conversations: {
      [id: string]: ConversationsTypes
    }
  }
}

interface MainPresenceTypes {
  mainPresence: {
    status: string
    username: string
  }
}

interface ConversationsTypes {
  id: string
  owner: string
  chDest: string | null
  linkedId: string
  uniqueId: string
  chSource: {
    type: 'source'
    channel: string
    callerNum: string
    startTime: number
    callerName: string
    bridgedNum: string
    bridgedName: string
    inConference: boolean
    channelStatus: 'up' | 'down'
    bridgedChannel: string
  }
  duration: number
  startTime: number
  connected: false
  recording: 'false' | 'true'
  direction: 'out' | 'in'
  inConference: false
  throughQueue: false
  throughTrunk: false
  counterpartNum: string
  counterpartName: string
}

interface ExtenUpdateTypes {
  ip: string
  cf: string
  mac: string
  cfb: string
  cfu: string
  dnd: false
  cfVm: string
  port: string
  name: string
  cfbVm: string
  cfuVm: string
  exten: string
  codecs: string[]
  status: string
  context: 'cti-profile-4'
  chanType: string
  username: string
  sipuseragent: string
  conversations: {
    [id: string]: ConversationsTypes
  }
}
