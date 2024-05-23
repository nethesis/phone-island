// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC } from 'react'
import { useEventListener, eventDispatch } from '../utils'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import {
  callNumber,
  muteCurrentCall,
  unmuteCurrentCall,
  pauseCurrentCall,
  unpauseCurrentCall,
  parkCurrentCall,
  answerIncomingCall,
  hangupCurrentCall,
} from '../lib/phone/call'

export const CallEvents: FC<{ sipHost: string }> = ({ sipHost }) => {
  const dispatch = useDispatch<Dispatch>()

  /**
   * Event listner for phone-island-call-* events
   */
  useEventListener('phone-island-call-start', (data: CallStartTypes) => {
    const number = data.number.replace(/\s/g, '')
    callNumber(number, sipHost)
  })
  useEventListener('phone-island-call-hold', () => {
    pauseCurrentCall()
  })
  useEventListener('phone-island-call-unhold', () => {
    unpauseCurrentCall()
  })
  useEventListener('phone-island-call-mute', () => {
    muteCurrentCall()
  })
  useEventListener('phone-island-call-unmute', () => {
    unmuteCurrentCall()
  })

  useEventListener('phone-island-call-park', () => {
    parkCurrentCall()
  })
  useEventListener('phone-island-call-answer', () => {
    answerIncomingCall()
  })
  useEventListener('phone-island-call-end', () => {
    hangupCurrentCall()
  })

  useEventListener('phone-island-call-listen', (data: ListenIntrudeTypes) => {
    dispatch.listen.setUpdateListenStatus(true, data.number)
    eventDispatch('phone-island-call-listened', {})
    dispatch.island.toggleActionsExpanded(false)
  })

  useEventListener('phone-island-call-intrude', (data: ListenIntrudeTypes) => {
    dispatch.listen.setUpdateIntrudeStatus(true, data.number)
    eventDispatch('phone-island-call-intruded', {})
    dispatch.island.toggleActionsExpanded(false)
  })

  return <></>
}

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

interface CallStartTypes {
  number: string
}

interface OutgoingCallStartedTypes {
  name: string
  number: string
}

interface ListenIntrudeTypes {
  number: string
}
