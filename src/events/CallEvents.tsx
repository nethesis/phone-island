// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC } from 'react'
import { useEventListener } from '../utils/useEventListener'
import { call } from '../lib/phone/call'

const BASE_HOST_URL: string = '127.0.0.1'

interface CallEventsProps {
  janus: any
  sipcall: any
}

export const CallEvents: FC<CallEventsProps> = ({ janus, sipcall }) => {
  /**
   * Add event listner for call
   */
  useEventListener('phone-island-call-start', (data) => {
    console.log(data.detail.number)
    const callURI = 'sip:' + data.detail.number + '@' + BASE_HOST_URL
    call(janus, sipcall, callURI)
  })
  return <></>
}
