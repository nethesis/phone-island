// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface MainPresenceEventTypes {
  [username: string]: {
    mainPresence: string
  }
}

export interface MainPresenceTypes {
  mainPresence: {
    status: string
    username: string
  }
}

export interface QueuesEventType {
  [queue: string]: QueuesUpdateTypes
}

export interface QueuesUpdateTypes {
  name: string
  queue: string
  members: {
    [member: string]: QueueUpdateMemberTypes
  }
  avgHoldTime: string
  avgTalkTime: string
  waitingCallers: {
    [id: string]: QueueUpdateWaitingCallersTypes
  }
  completedCallsCount: string
  abandonedCallsCount: string
  serviceLevelTimePeriod: string
  serviceLevelPercentage: string
}

export interface QueuesMemberEventType {
  [member: string]: QueueUpdateMemberTypes
}

export interface QueueUpdateMemberTypes {
  type: string
  name: string
  queue: string
  member: string
  paused: boolean
  loggedIn: boolean
  callsTakenCount: number
  lastCallTimestamp: number
  lastPausedInReason: string
  lastPausedInTimestamp: number
  lastPausedOutTimestamp: number
}

export interface QueueUpdateWaitingCallersTypes {
  id: string
  num: string
  name: string
  queue: string
  waiting: number
  channel: string
  position: string
  waitingTime: number
}

export interface ParkingUpdateEventTypes {
  [parking: string]: ParkingUpdateTypes
}

export interface ParkingUpdateTypes {
  name: string
  parking: string
  timeout: number
  parkedCaller: ParkingCallerTypes
}

export interface ParkingCallerTypes {
  num: string
  name: string
  parking: string
  channel: string
  timeout: number
  parkeeNum: string
  parkeeName: string
}
