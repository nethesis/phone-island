// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Checks if a number is from an external source (trunk) by verifying
 * if it's not an internal extension
 *
 * @param counterpartNum The number to check
 * @returns true if the call is from trunk (external), false if internal extension
 */
export function isFromTrunk(counterpartNum: string): boolean {
  const { extensions } = store.getState().users

  if (!extensions || !counterpartNum) {
    return false
  }

  // Check if the counterpartNum exists as an extension
  const isInternalExtension = Object.keys(extensions).includes(counterpartNum)

  // If it's not an internal extension, it's from trunk (external)
  return !isInternalExtension
}
