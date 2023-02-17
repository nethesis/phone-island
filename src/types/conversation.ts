// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface ConversationsEventType {
  [username: string]: {
    conversations: {
      [id: string]: ConversationsTypes
    }
  }
}

export interface ConversationsTypes {
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