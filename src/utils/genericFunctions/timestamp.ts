// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Get current time from in seconds
 */
export function getTimestampInSeconds () {
  return Math.floor(Date.now() / 1000)
}
