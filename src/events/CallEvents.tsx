// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC } from 'react'
import { useEventListener, eventDispatch } from '../utils'
import { callSipURI } from '../lib/phone/call'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const BASE_HOST_URL: string = '127.0.0.1'

export const CallEvents: FC = () => {
  const { sipcall }: any = useSelector((state: RootState) => state.webrtc)
  /**
   * Event listner for phone-island-call-start event
   */
  useEventListener('phone-island-call-start', (data) => {
    const callURI = 'sip:' + data.number + '@' + BASE_HOST_URL
    callSipURI(callURI)
  })
  return sipcall && <></>
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
