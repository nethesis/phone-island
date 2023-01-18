// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import { io } from 'socket.io-client'
import incomingRingtone from '../static/incoming_ringtone'
import { getDisplayName, type ConvType } from '../lib/phone/conversation'
import { updateLocalAudioSource } from '../lib/phone/audio'
import { dispatchMainPresence, dispatchConversations } from '../events/SocketEvents'

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
                incoming: true
              })
              // Update the audio source
              updateLocalAudioSource({
                src: incomingRingtone,
              }).then(() => {
                // Play the outgoing ringtone when ready
                dispatch.player.playLocalAudio({
                  loop: true,
                })
              })
              break
            // @ts-ignore
            case 'busy':
              if (conv && conv.connected) {
                // Accepted call
                dispatch.currentCall.updateCurrentCall({
                  accepted: true,
                  incoming: false,
                  outgoing: false,
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                  startTime: `${conv.startTime / 1000}`,
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

      socket.on('userMainPresenceUpdate', (res) => {
        // Pass data to dispatchMainPresence
        dispatchMainPresence(res)
      })

      socket.on('extenUpdate', (res) => {
        // Call the dispatchConversations
        dispatchConversations(res)

        // Handle only the events of the user
        if (res.username === username) {
          handleCalls(res)
        }
      })
    }

    initWsConnection()
  }, [])

  return <>{children}</>
}
