// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Checks if a number is from a streaming source
 *
 * @param number The phone number to check
 * @returns boolean - true if the number belongs to a streaming source
 */
export const isFromStreaming = (number: string): boolean => {
  // Get streaming sources from the store
  const { videoSources } = store.getState().streaming

  // If no video sources, return false
  if (!videoSources || Object.keys(videoSources).length === 0) {
    return false
  }

  // Check if the number matches any streaming source extension
  return Object.values(videoSources).some((source) => source.extension === number)
}
