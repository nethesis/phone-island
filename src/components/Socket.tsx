// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../store'
import { io } from 'socket.io-client'
import { getDisplayName } from '../lib/phone/conversation'
import {
  dispatchMainPresence,
  dispatchConversations,
  dispatchQueueUpdate,
  dispatchQueueMemberUpdate,
  dispatchAlreadyLogin,
  dispatchServerReload,
  dispatchParkingUpdate,
} from '../events'
import { store } from '../store'
import { eventDispatch, withTimeout } from '../utils'
import type {
  ConversationTypes,
  ExtensionTypes,
  QueuesUpdateTypes,
  QueueUpdateMemberTypes,
  MainPresenceTypes,
} from '../types'
import { getTimestampInSeconds } from '../utils/genericFunctions/timestamp'
import { userTotallyFree } from '../lib/user/extensions'

interface SocketProps {
  children: ReactNode
  hostName: string
  username: string
  authToken: string
  reload: boolean
  reloadedCallback: () => void
}

export const Socket: FC<SocketProps> = ({
  hostName,
  username,
  authToken,
  reload,
  reloadedCallback,
  children,
}) => {
  const dispatch = useDispatch<Dispatch>()
  const connectionCheckInterval = useRef<any>()
  const socket = useRef<any>()

  // get user information
  const userInformation = useSelector((state: RootState) => state.currentUser)

  const checkDefaultDeviceConversationActive = (conv: any) => {
    dispatch.currentCall.updateCurrentCall({
      conversationId: conv.id,
      accepted: true,
      incoming: conv.direction === 'in' ? false : undefined,
    })

    // Stop the local audio element ringing
    store.dispatch.player.stopAudioPlayer()
  }

  const checkDefaultDeviceConversationClosed = (conv: any) => {
    // store.dispatch.player.stopAudioPlayer()
    store.dispatch.currentCall.reset()
    // store.dispatch.listen.reset()
  }

  useEffect(() => {
    /**
     * Manages event and data for the currentUser
     *
     * @param res The data from the socket
     * @param conv The conversation data
     */
    const handleCurrentUserEvents = (res: ExtensionTypes, conv: ConversationTypes) => {
      // Handle transferring data
      const { transferring, transferSwitching, transferCalls } = store.getState().currentCall

      // Check conversation isn't empty
      if (Object.keys(conv).length > 0) {
        // With conversation
        if (res.status) {
          const { extensions } = store.getState().users
          switch (res.status) {
            case 'ringing':
              // The name and the number are updated here not in webrtc
              dispatch.currentCall.checkIncomingUpdatePlay({
                conversationId: conv.id,
                displayName: getDisplayName(conv),
                number: `${conv.counterpartNum}`,
                incomingSocket: true,
                username:
                  `${
                    extensions &&
                    extensions[conv.counterpartNum] &&
                    extensions[conv.counterpartNum].username
                  }` || '',
                ownerExtension: conv.owner,
              })
              break
            // @ts-ignore
            case 'busy':
              if (conv && conv.connected) {
                // Current call accepted and update connected call
                dispatch.currentCall.updateCurrentCall({
                  conversationId: conv.id,
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                  startTime: `${conv.startTime / 1000}`,
                  ownerExtension: conv.owner,
                  username:
                    `${
                      extensions &&
                      extensions[conv.counterpartNum] &&
                      extensions[conv.counterpartNum].username
                    }` || '',
                })
                // Add call to transfer calls
                dispatch.currentCall.addTransferCalls({
                  type: 'transferred',
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                  startTime: `${getTimestampInSeconds()}`,
                })

                if (userInformation?.default_device?.type !== 'webrtc') {
                  checkDefaultDeviceConversationActive(conv)
                }
              }
              // Handle not connected calls
              else if (conv && !conv.connected) {
                if (transferring && !transferSwitching) {
                  // Handle hangup during transfer
                  const inTransferCalls = transferCalls.find(
                    (item) => item.number === conv.counterpartNum,
                  )
                  if (!conv.connected && inTransferCalls) {
                    // Update transferring data for the current call
                    dispatch.currentCall.updateCurrentCall({
                      transferring: false,
                    })
                    // Reset transfer switching
                    // TODO - It needs to enhance how conversation connections (conv.connected) are updated server side
                    // TODO - The transfer end is not handled when the an user hangups or after call switch
                    dispatch.currentCall.updateTransferSwitching(false)
                  }
                }
              }
              // Handle outgoing call
              if (conv && !conv.connected && conv.direction === 'out') {
                // Update the current outgoing conversation
                dispatch.currentCall.checkOutgoingUpdate({
                  outgoingSocket: true,
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                  username:
                    `${
                      extensions &&
                      extensions[conv.counterpartNum] &&
                      extensions[conv.counterpartNum].username
                    }` || '',
                })
              }
            case 'onhold':
              // The new conversation during transferring
              const { counterpartName, counterpartNum, startTime } = conv
              if (
                transferring &&
                counterpartNum &&
                counterpartName &&
                counterpartName !== '<unknown>'
              ) {
                // Add call to transfer calls
                dispatch.currentCall.addTransferCalls({
                  type: 'destination',
                  displayName: getDisplayName(conv),
                  number: counterpartNum,
                  startTime: `${getTimestampInSeconds()}`,
                })
                // Set the current call informations
                dispatch.currentCall.updateCurrentCall({
                  displayName: getDisplayName(conv),
                  number: counterpartNum,
                  startTime: `${startTime / 1000}`,
                  conversationId: conv.id,
                })
                // Set the view of the island to call
                dispatch.island.setIslandView('call')
              }
              break
            default:
              break
          }
        }
      } else {
        // Without conversation for physical phone management
        if (res.status == 'online' && userTotallyFree()) {
          // Stop ringing sounds
          dispatch.player.stopAudioPlayer()
          // Reset current call info
          dispatch.currentCall.reset()
        }
      }
    }

    /**
     * Initialize socket connection and listeners
     */
    const initSocketConnection = () => {
      socket.current = io('https://' + hostName, {
        upgrade: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
      })

      // Handle socket errors
      socket.current.on('connect', () => {
        console.debug(`Socket connected sid: ${socket.current.id}`)
        eventDispatch('phone-island-socket-connected', {})
      })
      socket.current.on('disconnect', (reason) => {
        console.debug(`Socket disconnect - reason: ${reason}`)
        if (reason.includes('server disconnect')) {
          eventDispatch('phone-island-server-disconnected', {})
        } else {
          eventDispatch('phone-island-socket-disconnected', {})
        }
      })
      socket.current.io.on('error', (err) => {
        console.debug(`Socket error: `, err)
      })
      socket.current.on('connect_error', (err) => {
        console.debug(`Socket connect_error: `, err)
      })
      socket.current.io.on('reconnect', (attempt) => {
        eventDispatch('phone-island-socket-reconnected', {})
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
            7 * 1000, // Waits for the response 7 seconds
          ),
        )
      }, 7 * 1000) // Executes a new check every 7 seconds

      // Handle connection message
      socket.current.on('connect', () => {
        console.debug('Socket on: ' + hostName + ' is connected!')
        socket.current.emit('login', {
          accessKeyId: `${username}`,
          token: authToken,
          uaType: 'desktop',
        })
      })

      // Handle authentication success message
      socket.current.on('authe_ok', () => {
        console.debug('Socket authentication success!')
      })

      socket.current.on('userMainPresenceUpdate', (res: MainPresenceTypes) => {
        // Update endpoints store
        store.dispatch.users.updateEndpointMainPresence({ ...res.mainPresence })
        // Dispatch dispatchMainPresence Event
        dispatchMainPresence(res)
      })

      socket.current.on('extenUpdate', (res: ExtensionTypes) => {
        // Update extensions and conversations in users store
        dispatch.users.updateExtension(res)
        // Dispatch conversations event
        dispatchConversations(res)
        // Initialize conversation
        const conv = res.conversations[Object.keys(res.conversations)[0]] || {}
        // Handle only the events of the user
        if (res.username === username) {
          handleCurrentUserEvents(res, conv)
          // Update the conversations of the user
          dispatch.currentUser.updateConversations(res)
        }
      })

      // `queueUpdate` is the socket event when the data of a queue updates
      socket.current.on('queueUpdate', (res: QueuesUpdateTypes) => {
        // Dispatch queueUpdate event
        dispatchQueueUpdate(res)
      })

      // `queueMemberUpdate` is the socket event when the data of a queue member changes
      socket.current.on('queueMemberUpdate', (res: QueueUpdateMemberTypes) => {
        // Dispatch queueMemberUpdate event
        dispatchQueueMemberUpdate(res)
      })

      // `takeOver` is the socket event when the user does login from another new window
      socket.current.on('takeOver', () => {
        // Dispatch takeOver event
        dispatchAlreadyLogin()
      })

      // `serverReload` is the socket event when server is reloaded
      socket.current.on('serverReloaded', () => {
        // Dispatch serverReload event
        dispatchServerReload()
      })

      // `serverReload` is the socket event when server is reloaded
      socket.current.on('parkingUpdate', () => {
        // Dispatch serverReload event
        dispatchParkingUpdate()
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

  // Manage reload events
  useEffect(() => {
    if (reload) {
      console.info('websocket reconnection')
      socket.current.disconnect()
      socket.current.connect()
      reloadedCallback()
    }
  }, [reload])

  return <>{children}</>
}
