// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'
import { getVideoSources } from '../../services/user'

/**
 * Loads the video sources the user can see into the store: at startup and when the server
 * reports a reload (a source created or changed in the wizard)
 */
export const loadVideoSources = async (): Promise<void> => {
  const videoSources: any = await getVideoSources()
  if (videoSources) {
    store.dispatch.streaming.updateVideoSources(videoSources)
  }
}
