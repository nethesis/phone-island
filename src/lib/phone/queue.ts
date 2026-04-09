// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { QueueStoreTypes, QueueWaitingCallerReference } from '../../models/queue'
import type { ConversationTypes } from '../../types'

export interface CurrentCallQueueContext {
  throughQueue: boolean
  queueId: string
  queueName: string
  queueNumber: string
  queuePosition: string
  queueWaitingTime: number
}

const emptyQueueContext: CurrentCallQueueContext = {
  throughQueue: false,
  queueId: '',
  queueName: '',
  queueNumber: '',
  queuePosition: '',
  queueWaitingTime: 0,
}

function getExplicitQueueId(conv: ConversationTypes): string {
  return conv?.queueId || conv?.queue || ''
}

function getExplicitQueueName(conv: ConversationTypes): string {
  return conv?.queueName || ''
}

function getQueueLabel(queueName: string, queueNumber: string): string {
  return queueName || queueNumber
}

function getCandidatesByNumber(
  number: string,
  queueState: QueueStoreTypes,
): QueueWaitingCallerReference[] {
  if (!number) {
    return []
  }

  return queueState?.waitingCallersByNumber[number] || []
}

function findMatchingWaitingCaller(
  conv: ConversationTypes,
  queueState: QueueStoreTypes,
): QueueWaitingCallerReference | undefined {
  const explicitQueueId = getExplicitQueueId(conv)
  const linkedIdCandidate =
    queueState?.waitingCallersById?.[conv?.linkedId] || queueState?.waitingCallersById?.[conv?.uniqueId]

  if (linkedIdCandidate) {
    return linkedIdCandidate
  }

  const channelCandidate =
    queueState?.waitingCallersByChannel?.[conv?.chSource?.channel || ''] ||
    queueState?.waitingCallersByChannel?.[conv?.chDest?.channel || '']

  if (channelCandidate) {
    return channelCandidate
  }

  const candidatesByNumber = getCandidatesByNumber(conv?.counterpartNum, queueState)

  if (explicitQueueId) {
    return candidatesByNumber.find((candidate) => candidate?.queue === explicitQueueId)
  }

  if (candidatesByNumber.length === 1) {
    return candidatesByNumber[0]
  }

  return undefined
}

export function getCurrentCallQueueContext(
  conv: ConversationTypes,
  queueState: QueueStoreTypes,
): CurrentCallQueueContext {
  const explicitQueueId = getExplicitQueueId(conv)
  const explicitQueueName = getExplicitQueueName(conv)
  const matchedWaitingCaller = findMatchingWaitingCaller(conv, queueState)
  const matchedQueueId = explicitQueueId || matchedWaitingCaller?.queue || ''
  const matchedQueue = matchedQueueId ? queueState.byQueue[matchedQueueId] : undefined
  const queueName = explicitQueueName || matchedQueue?.name || matchedWaitingCaller?.queueName || ''
  const queueNumber = conv.queueNumber || matchedQueue?.queue || matchedQueueId
  const throughQueue = Boolean(conv.throughQueue || getQueueLabel(queueName, queueNumber))

  if (!throughQueue) {
    return emptyQueueContext
  }

  return {
    throughQueue,
    queueId: matchedQueueId,
    queueName,
    queueNumber,
    queuePosition: matchedWaitingCaller?.position || '',
    queueWaitingTime: matchedWaitingCaller?.waitingTime || 0,
  }
}
