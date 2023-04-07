// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC } from 'react'
import { useEventListener, eventDispatch } from '../utils'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { callNumber } from '../lib/phone/call'

export const CallEvents: FC = () => {
  const { sipcall }: any = useSelector((state: RootState) => state.webrtc)
  /**
   * Event listner for phone-island-call-start event
   */
  useEventListener('phone-island-call-start', (data) => {
    callNumber(data.number)
  })
  return <></>
}

// !TODO add phone-island-outgoing-call-started phone-island-outgoing-call-ended

/**
 * Dispatch the phone-island-outgoing-call-started event
 */
export function dispatchOutgoingCallStarted(name: string = '', number: string = '') {
  const data: OutgoingCallStartedTypes = {
    name,
    number,
  }
  eventDispatch('phone-island-outgoing-call-started', data)
}

export interface OutgoingCallStartedTypes {
  name: string
  number: string
}
