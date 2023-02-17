// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import { io } from 'socket.io-client'
import { getDisplayName, type ConvType } from '../lib/phone/conversation'
import { dispatchMainPresence, dispatchConversations } from '../events'
import { store } from '../store'

interface SocketProps {
  children: ReactNode
  hostName: string
  username: string
  authToken: string
}

export const Socket: FC<SocketProps> = ({ hostName, username, authToken, children }) => {
  const dispatch = useDispatch<Dispatch>()

  useEffect(() => {
    const handleCalls = (res: any, conv) => {
      // Check conversation isn't empty
      if (Object.keys(conv).length > 0) {
        const status: string = res.status
        if (status) {
          const { extensions } = store.getState().users
          switch (status) {
            case 'ringing':
              // The name and the number are updated here not in webrtc
              dispatch.currentCall.checkIncomingUpdateAndPlay({
                displayName: getDisplayName(conv),
                number: `${conv.counterpartNum}`,
                incomingSocket: true,
                username: `${extensions && extensions[conv.counterpartNum].username}` || '',
              })
              break
            // @ts-ignore
            case 'busy':
              if (conv && conv.connected) {
                // Set current call accepted
                dispatch.currentCall.updateCurrentCall({
                  accepted: true,
                  incoming: false,
                  outgoing: false,
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                  startTime: `${conv.startTime / 1000}`,
                  username: `${extensions && extensions[conv.counterpartNum].username}` || '',
                })
              }
              // Handle outgoing call
              else if (conv && !conv.connected && conv.direction === 'out') {
                // Update the current outgoing conversation
                dispatch.currentCall.checkOutgoingUpdateAndPlay({
                  outgoingSocket: true,
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                  username: `${extensions && extensions[conv.counterpartNum].username}` || '',
                })
              }
            default:
              break
          }
        }
      }
    }

    const initWsConnection = () => {
      const socket = io(hostName, {
        upgrade: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
      })

      socket.on('connect', () => {
        console.log('Socket on: ' + hostName + ' is connected !')
        socket.emit('login', {
          accessKeyId: `${username}`,
          token: authToken,
          uaType: 'desktop',
        })
      })

      socket.on('authe_ok', () => {
        console.log('auth_ok')
      })

      socket.on('userMainPresenceUpdate', (res) => {
        // Pass data to dispatchMainPresence
        dispatchMainPresence(res)
      })

      socket.on('extenUpdate', (res) => {
        // Call the dispatchConversations
        dispatchConversations(res)
        // Initialize conversation
        const conv: ConvType = res.conversations[Object.keys(res.conversations)[0]] || {}
        // Handle only the events of the user
        if (res.username === username) {
          handleCalls(res, conv)
        }
      })
    }

    initWsConnection()
  }, [])

  return <>{children}</>
}
