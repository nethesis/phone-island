// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import { io } from 'socket.io-client'

interface SocketProps {
  children: ReactNode
  host_name: string
  username: string
  auth_token: string
}

interface ConvType {
  [index: string]: string | number
}

export const Socket: FC<SocketProps> = ({ host_name, username, auth_token, children }) => {
  const dispatch = useDispatch<Dispatch>()

  useEffect(() => {
    const getDisplayName = (conv: ConvType): string => {
      let dispName = ''
      if (
        conv &&
        conv.counterpartName !== '<unknown>' &&
        typeof conv.counterpartName === 'string' &&
        conv.counterpartName.length > 0
      ) {
        dispName = conv.counterpartName
      } else if (
        conv &&
        conv.counterpartNum &&
        typeof conv.counterpartNum === 'string' &&
        conv.counterpartNum.length > 0
      ) {
        dispName = conv.counterpartNum
      } else {
        dispName = 'Anonymous'
      }
      return dispName
    }

    const handleCalls = (res: any) => {
      // Initialize conversation
      const conv: ConvType = res.conversations[Object.keys(res.conversations)[0]] || {}
      // Check conversation isn't empty
      if (Object.keys(conv).length > 0) {
        const status: string = res.status
        if (status) {
          switch (status) {
            case 'ringing':
              dispatch.currentCall.updateCurrentCall({
                displayName: getDisplayName(conv),
              })
              break
            default:
              break
          }
        }
      }
    }

    const initWsConnection = () => {
      const socket = io(host_name, {
        upgrade: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
      })

      socket.on('connect', () => {
        console.log('Socket on: ' + host_name + ' is connected !')
        socket.emit('login', {
          accessKeyId: `${username}_phone-island`,
          token: auth_token,
          uaType: 'desktop',
        })
      })

      socket.on('authe_ok', () => {
        console.log('AUTH OK')
      })

      socket.on('extenUpdate', (res) => {
        if (res.username === username) {
          handleCalls(res)
        }
      })
    }

    initWsConnection()
  }, [])

  return <>{children}</>
}
