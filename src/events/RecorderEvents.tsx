// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { eventDispatch } from '../utils'
import { useEventListener } from '../utils'
import { useDispatch } from 'react-redux'
import { Dispatch, store } from '../store'

export const RecorderEvents: FC = () => {
  const dispatch = useDispatch<Dispatch>()

  //Recording could be started from the web interface or from the physical device

  /**
   * Event listner for phone-island-audio-player-start event if webRtc is main device
   */
  useEventListener('phone-island-recording-open', (data: {}) => {
    dispatch.island.setIslandView('recorder')
    eventDispatch('phone-island-recording-opened', {})
  })

  /**
   * Event listner for phone-island-recording-start event if physical device is main device
   */
  useEventListener('phone-island-physical-recording-open', (data: {}) => {
    dispatch.island.setIslandView('physicalPhoneRecorder')
    eventDispatch('phone-island-physical-recording-opened', {})
  })

  return <></>
}

/**
 * Dispatch recording save
 */
export function dispatchRecordingSave() {
  const tempFileName = store.getState().recorder.tempFileName
  const audioFileURL = store.getState().player.audioPlayer?.current?.src || ''
  eventDispatch('phone-island-recording-saved', {
    tempFileName,
    audioFileURL,
  })
}
