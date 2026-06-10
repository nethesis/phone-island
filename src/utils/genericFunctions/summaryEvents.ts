// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { eventDispatch } from './eventDispatch'

export type SummaryEventSource = 'check' | 'socket' | 'cti-polling'

export interface SummaryEventPayload {
  linkedid?: string
  uniqueid?: string
  display_name?: string
  display_number?: string
  source?: SummaryEventSource
}

export function dispatchSummaryReady(payload: SummaryEventPayload) {
  eventDispatch('phone-island-summary-ready', payload)
}

export function dispatchSummaryNotReady(payload: SummaryEventPayload) {
  eventDispatch('phone-island-summary-not-ready', payload)
}
