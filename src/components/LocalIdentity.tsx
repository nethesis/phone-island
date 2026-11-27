// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, type FC, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch, store } from '../store'
import { useEventListener } from '../utils'
import type { UserExtensionTypes } from '../types'

interface LocalIdentityProps {
  children: ReactNode
  sipExten: string
  displayName?: string
}

export const LocalIdentity: FC<LocalIdentityProps> = ({ sipExten, displayName, children }) => {
  const dispatch = useDispatch<Dispatch>()
  const [ready, setReady] = useState<boolean>(false)

  useEffect(() => {
    const extension: UserExtensionTypes = {
      id: sipExten,
      type: 'webrtc',
      secret: '',
      username: sipExten,
      description: '',
      actions: {
        answer: true,
        dtmf: true,
        hold: true,
      },
      proxy_port: null,
      exten: sipExten,
    }
    dispatch.currentUser.updateCurrentUser({
      name: displayName || 'Admin',
      username: sipExten,
      mainPresence: 'online',
      default_device: extension,
      endpoints: {
        email: [],
        jabber: [],
        extension: [extension],
        cellphone: [],
        voicemail: [],
        mainextension: [{ id: sipExten, description: '' }],
      },
    })
    dispatch.currentUser.setCurrentUserReady(true)
    dispatch.fetchDefaults.setFetchReady()
    setReady(true)
  }, [sipExten, displayName])

  useEventListener('phone-island-call-start', (data: { number?: string }) => {
    const number = String(data?.number || '').replace(/[^0-9+*#]/g, '')
    const { incoming, outgoing, accepted } = store.getState().currentCall
    if (!number || incoming || outgoing || accepted) {
      return
    }
    dispatch.currentCall.updateCurrentCall({
      number,
      displayName: number,
    })
  })

  return <>{ready && children}</>
}
