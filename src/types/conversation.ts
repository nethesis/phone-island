// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface ConversationsEventType {
  [username: string]: {
    conversations: ConversationsTypes
  }
}

export interface ConversationsTypes {
  [id: string]: ConversationTypes
}

export interface ConversationTypes {
  id: string
  owner: string
  chDest: ChTypes | null
  linkedId: string
  uniqueId: string
  chSource: ChTypes | null
  duration: number
  startTime: number
  connected: boolean
  recording: 'false' | 'true'
  recordingControlAvailable?: boolean
  direction: 'out' | 'in'
  inConference: boolean
  throughQueue: boolean
  throughTrunk: boolean
  counterpartNum: string
  counterpartName: string
  queue?: string
  queueId?: string
  queueName?: string
  queueNumber?: string
}

interface ChTypes {
  type: 'source' | 'destination'
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
