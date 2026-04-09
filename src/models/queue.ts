// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type {
  QueueUpdateMemberTypes,
  QueueUpdateWaitingCallersTypes,
  QueuesUpdateTypes,
} from '../types'

export interface QueueWaitingCallerReference extends QueueUpdateWaitingCallersTypes {
  queueName: string
}

export interface QueueStoreTypes {
  byQueue: Record<string, QueuesUpdateTypes>
  byMember: Record<string, QueueUpdateMemberTypes>
  waitingCallersByNumber: Record<string, QueueWaitingCallerReference[]>
  waitingCallersByChannel: Record<string, QueueWaitingCallerReference>
  waitingCallersById: Record<string, QueueWaitingCallerReference>
  lastUpdatedAt: number | null
}

const defaultState: QueueStoreTypes = {
  byQueue: {},
  byMember: {},
  waitingCallersByNumber: {},
  waitingCallersByChannel: {},
  waitingCallersById: {},
  lastUpdatedAt: null,
}

function buildWaitingCallersIndexes(byQueue: Record<string, QueuesUpdateTypes>) {
  const waitingCallersByNumber: QueueStoreTypes['waitingCallersByNumber'] = {}
  const waitingCallersByChannel: QueueStoreTypes['waitingCallersByChannel'] = {}
  const waitingCallersById: QueueStoreTypes['waitingCallersById'] = {}

  Object.values(byQueue).forEach((queueData) => {
    Object.values(queueData.waitingCallers || {}).forEach((caller) => {
      const callerReference: QueueWaitingCallerReference = {
        ...caller,
        queueName: queueData.name,
      }

      if (caller.num) {
        if (!waitingCallersByNumber[caller.num]) {
          waitingCallersByNumber[caller.num] = []
        }

        waitingCallersByNumber[caller.num].push(callerReference)
      }

      if (caller.channel) {
        waitingCallersByChannel[caller.channel] = callerReference
      }

      if (caller.id) {
        waitingCallersById[caller.id] = callerReference
      }
    })
  })

  return {
    waitingCallersByNumber,
    waitingCallersByChannel,
    waitingCallersById,
  }
}

export const queue = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateQueue: (state, payload: QueuesUpdateTypes) => {
      const byQueue = {
        ...state.byQueue,
        [payload.queue]: payload,
      }
      const indexes = buildWaitingCallersIndexes(byQueue)

      return {
        ...state,
        byQueue,
        ...indexes,
        lastUpdatedAt: Date.now(),
      }
    },
    updateQueueMember: (state, payload: QueueUpdateMemberTypes) => {
      return {
        ...state,
        byMember: {
          ...state.byMember,
          [payload.member]: payload,
        },
        lastUpdatedAt: Date.now(),
      }
    },
    reset: () => {
      return defaultState
    },
  },
})