// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC } from 'react'
import { useEventListener } from '../utils/useEventListener'
import { callSipURI } from '../lib/phone/call'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const BASE_HOST_URL: string = '127.0.0.1'

export const CallEvents: FC = () => {
  const { sipcall }: any = useSelector((state: RootState) => state.webrtc)
  /**
   * Add event listner for call
   */
  useEventListener('phone-island-call-start', (data) => {
    const callURI = 'sip:' + data.number + '@' + BASE_HOST_URL
    callSipURI(callURI)
  })
  return sipcall && <></>
}
