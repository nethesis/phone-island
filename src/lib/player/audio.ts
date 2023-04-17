// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getAnnouncement, getAllAnnouncementsInfo } from '../../services/offhour'
import { getCallRecording, getRecordingFileName } from '../../services/history_call'
import { store } from '../../store'
import { AnnouncementInfoTypes } from '../../types'

/**
 * Given an id plays an announcement
 */
export async function playAnnouncement(id: string) {
  if (id) {
    const audioFile: string = await getAnnouncement(id)
    if (audioFile) {
      store.dispatch.island.setIslandView('player')
      store.dispatch.player.setAudioPlayerType('announcement')
      store.dispatch.player.updateStartAudioPlayer({
        src: audioFile,
      })
    }
  }
}

/**
 * Given an id plays a call recording
 */
export async function playCallRecording(id: string) {
  if (id) {
    const audioFile: string = await getCallRecording(id)
    if (audioFile) {
      store.dispatch.island.setIslandView('player')
      store.dispatch.player.setAudioPlayerType('call_recording')
      store.dispatch.player.updateStartAudioPlayer({
        src: audioFile,
      })
    }
  }
}

/**
 * Given an id retrieves the name of the call recording
 */
export async function getRecordingName(id: string) {
  if (id) {
    const fileName: string = await getRecordingFileName(id)
    if (fileName) {
      store.dispatch.player.setAudioPlayerTrackName(fileName)
    }
  }
}

/**
 * Given an id retrieves the name of the call recording
 */
export async function getAnnouncementName(id: string) {
  if (id) {
    const allAnnouncements: AnnouncementInfoTypes[] = await getAllAnnouncementsInfo()
    const announcement = allAnnouncements.find((announcement) => announcement.id.toString() === id)
    if (announcement?.description) {
      store.dispatch.player.setAudioPlayerTrackName(announcement.description)
    }
  }
}
