// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { eventDispatch } from '../utils'
import { useEventListener } from '../utils'
import { useDispatch } from 'react-redux'
import { Dispatch, store } from '../store'

export const RecorderEvents: FC = () => {
  const dispatch = useDispatch<Dispatch>()

  /**
   * Event listner for phone-island-audio-player-start event
   */
  useEventListener('phone-island-recording-start', (data: {}) => {
    dispatch.island.setIslandView('recorder')
  })

  return <></>
}

/**
 * Dispatch recording save
 */
export function dispatchRecordingSave() {
  const tempFilename = store.getState().recorder.tempFilename
  eventDispatch('phone-island-recording-save', {
    tempFilename: tempFilename
  })
}
