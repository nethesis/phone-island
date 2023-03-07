// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import { io } from 'socket.io-client'
import { getDisplayName } from '../lib/phone/conversation'
import {
  dispatchMainPresence,
  dispatchConversations,
  dispatchQueueUpdate,
  dispatchQueueMemberUpdate,
} from '../events'
import { store } from '../store'
import { withTimeout } from '../utils'
import type {
  ConversationsTypes,
  ExtensionTypes,
  QueuesUpdateTypes,
  QueueUpdateMemberTypes,
} from '../types'

interface SocketProps {
  children: ReactNode
  hostName: string
  username: string
  authToken: string
}

export const Socket: FC<SocketProps> = ({ hostName, username, authToken, children }) => {
  const dispatch = useDispatch<Dispatch>()
  const connectionCheckInterval = useRef<any>()
  const socket = useRef<any>()

  useEffect(() => {
    /**
     * Manages event and data for the currentUser
     *
     * @param res The data from the socket
     * @param conv The conversation data
     */
    const handleCurrentUserEvents = (res: any, conv: ConversationsTypes) => {
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
                username: `${extensions && extensions[conv.counterpartNum] && extensions[conv.counterpartNum].username}` || '',
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
                  username: `${extensions && extensions[conv.counterpartNum] && extensions[conv.counterpartNum].username}` || '',
                })
              }
              // Handle outgoing call
              else if (conv && !conv.connected && conv.direction === 'out') {
                // Update the current outgoing conversation
                dispatch.currentCall.checkOutgoingUpdateAndPlay({
                  outgoingSocket: true,
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                  username: `${extensions && extensions[conv.counterpartNum] && extensions[conv.counterpartNum].username}` || '',
                })
              }
            default:
              break
          }
        }
      }
    }

    /**
     * Initialize socket connection and listeners
     */
    const initSocketConnection = () => {
      socket.current = io(hostName, {
        upgrade: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
      })

      // Handle socket errors
      socket.current.on('connect', () => {
        console.debug(`Socket connected sid: ${socket.current.id}`)
      })
      socket.current.on('disconnect', (reason) => {
        console.log(`Socket disconnect - reason: ${reason}`)
      })
      socket.current.io.on('error', (err) => {
        console.debug(`Socket error: `, err)
      })
      socket.current.on('connect_error', (err) => {
        console.debug(`Socket connect_error: `, err)
      })
      socket.current.io.on('reconnect', (attempt) => {
        console.debug(`Socket reconnect attemp ${attempt} (sid: ${socket.current.id})`)
      })
      socket.current.io.on('reconnect_attempt', (attempt) => {
        console.debug(`Socket reconnect_attempt ${attempt}`)
      })
      socket.current.io.on('reconnect_error', (err) => {
        console.debug(`Socket reconnect_error: `, err)
      })
      socket.current.io.on('reconnect_failed', () => {
        console.debug(`Socket reconnect_failed`)
      })

      // Checks if socket is reachable every 5 seconds
      connectionCheckInterval.current = setInterval(() => {
        const start = Date.now()
        socket.current.volatile.emit(
          'ping',
          withTimeout(
            () => {
              // Remove socket_down alert
              dispatch.alerts.removeAlert('socket_down')
              // Calculate and log latency
              const latency = Date.now() - start
              console.debug(`Socket latency: ${latency}ms`)
              console.debug('Socket is reachable!')
            },
            () => {
              // Set socket_down alert
              dispatch.alerts.setAlert('socket_down')
              console.debug('Socket is unreachable!')
            },
            2000,
          ),
        )
      }, 5000)

      // Handle connection message
      socket.current.on('connect', () => {
        console.log('Socket on: ' + hostName + ' is connected!')
        socket.current.emit('login', {
          accessKeyId: `${username}`,
          token: authToken,
          uaType: 'desktop',
        })
      })

      // Handle authentication success message
      socket.current.on('authe_ok', () => {
        console.log('Socket authentication success!')
      })

      socket.current.on('userMainPresenceUpdate', (res) => {
        // Pass data to dispatchMainPresence
        dispatchMainPresence(res)
      })

      socket.current.on('extenUpdate', (res: ExtensionTypes) => {
        // Update extensions and conversations in users store
        dispatch.users.updateExtension(res)
        // Dispatch conversations event
        dispatchConversations(res)
        // Initialize conversation
        const conv: ConversationsTypes = res.conversations[Object.keys(res.conversations)[0]] || {}
        // Handle only the events of the user
        if (res.username === username) {
          handleCurrentUserEvents(res, conv)
        }
      })

      socket.current.on('queueUpdate', (res: QueuesUpdateTypes) => {
        // Dispatch queueUpdate event
        dispatchQueueUpdate(res)
      })

      socket.current.on('queueMemberUpdate', (res: QueueUpdateMemberTypes) => {
        // Dispatch queueMemberUpdate event
        dispatchQueueMemberUpdate(res)
      })
    }

    initSocketConnection()

    // Stop the check socket interval
    // Close the socket connection
    return () => {
      clearInterval(connectionCheckInterval.current)
      socket.current.close()
    }
  }, [])

  return <>{children}</>
}
