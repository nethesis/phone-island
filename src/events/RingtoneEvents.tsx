// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { eventDispatch } from '../utils'

/**
 * Dispatches the event to request available ringtones list
 */
export const dispatchRingtoneListRequest = () => {
  eventDispatch('phone-island-ringing-tone-list', {})
}

/**
 * Dispatches the event with the list of available ringtones
 */
export const dispatchRingtoneListResponse = (ringtones: RingtoneInfo[]) => {
  eventDispatch('phone-island-ringing-tone-list-response', { ringtones })
}

/**
 * Dispatches the event when a ringtone is selected
 */
export const dispatchRingtoneSelected = (name: string) => {
  eventDispatch('phone-island-ringing-tone-selected', { name })
}

/**
 * Dispatches the event when ringtone output device is changed
 */
export const dispatchRingtoneOutputChanged = (deviceId: string) => {
  eventDispatch('phone-island-ringing-tone-output-changed', { deviceId })
}

export interface RingtoneInfo {
  name: string
  displayName: string
  base64Audio: string
}
