// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Returns the streaming source ID corresponding to an extension number
 *
 * @param extensionNumber The extension number to search for
 * @returns The source ID or undefined if not found
 */
export const getStreamingSourceId = (extensionNumber: string): string | undefined => {
  const { videoSources } = store.getState().streaming

  if (!videoSources || Object.keys(videoSources).length === 0) {
    return undefined
  }

  // Find the source that has the given extension
  const source = Object.values(videoSources).find((source) => source.extension === extensionNumber)

  return source?.id
}
