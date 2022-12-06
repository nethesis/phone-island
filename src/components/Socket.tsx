// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import { io } from 'socket.io-client'
import incomingRingtone from '../static/incoming_ringtone'
import { getDisplayName, type ConvType } from '../lib/phone/conversation'

interface SocketProps {
  children: ReactNode
  hostName: string
  username: string
  authToken: string
}

export const Socket: FC<SocketProps> = ({ hostName, username, authToken, children }) => {
  const dispatch = useDispatch<Dispatch>()

  useEffect(() => {
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
                number: `${conv.counterpartNum}`,
                incoming: true,
                ringing: true,
              })
              dispatch.player.updateAudioSource({
                src: incomingRingtone,
              })
              dispatch.player.playAudio({
                loop: true,
              })

              break
            // @ts-ignore
            case 'busy':
              if (conv && conv.connected) {
                // Accepted call
                dispatch.currentCall.updateCurrentCall({
                  accepted: true,
                  outgoing: false,
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                  startTime: `${conv.startTime/1000}`,
                })
              }
              // Handle outgoing call
              else if (conv && !conv.connected && conv.direction === 'out') {
                // Start an outgoing call
                dispatch.currentCall.updateCurrentCall({
                  outgoing: true,
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                })
              }
            default:
              break
          }
        }
      } else {
        console.log(res)
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
