// Copyright (C) 2024 Nethesis S.r.l.
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
  dispatchExtensions,
  dispatchUrlCall,
  dispatchDefaultDeviceUpdate,
  dispatchJoinScreenShare,
  dispatchLeaveScreenShare,
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
import { isEmpty } from '../utils/genericFunctions/isEmpty'
import { isPhysical } from '../lib/user/default_device'
import { ScreenSharingMessage } from './VideoView'

interface SocketProps {
  children: ReactNode
  hostName: string
  username: string
  authToken: string
  reload: boolean
  reloadedCallback: () => void
  uaType: string
}

export const Socket: FC<SocketProps> = ({
  hostName,
  username,
  authToken,
  reload,
  reloadedCallback,
  children,
  uaType,
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
    eventDispatch('phone-island-call-answered', {})

    // Stop the local audio element ringing
    store.dispatch.player.stopAudioPlayer()
    store.dispatch.player.setAudioPlayerLoop(false)
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

      const view = store.getState().island.view
      // Check conversation isn't empty
      if (Object.keys(conv).length > 0) {
        // With conversation
        if (res.status) {
          const { extensions } = store.getState().users
          const { default_device } = store.getState().currentUser
          const { endpoints, username } = store.getState().currentUser
          const { incoming, outgoing } = store.getState().currentCall

          const hasOnlineNethlink = () => {
            if (!extensions || !username) return false

            // Get all extensions for current user
            const userExtensions: any = Object.values(extensions).filter(
              (ext) => ext?.username === username,
            )

            // Check if any extension is nethlink type and online
            return userExtensions?.some((ext) => {
              const endpointExtension = endpoints?.extension.find(
                (endpoint) => endpoint.id === ext?.exten,
              )
              return endpointExtension?.type === 'nethlink' && ext?.status !== 'offline'
            })
          }
          switch (res.status) {
            case 'ringing':
              if (
                (uaType === 'mobile' && hasOnlineNethlink()) ||
                (uaType === 'desktop' &&
                  (default_device?.type === 'webrtc' ||
                    (default_device?.type === undefined && !hasOnlineNethlink()) ||
                    (!hasOnlineNethlink() && default_device?.type === 'physical')))
              ) {
                dispatch.currentCall.checkIncomingUpdatePlay({
                  conversationId: conv.id,
                  displayName: getDisplayName(conv),
                  number: `${conv.counterpartNum}`,
                  incomingSocket: true,
                  incoming: true,
                  username:
                    `${
                      extensions &&
                      extensions[conv.counterpartNum] &&
                      extensions[conv.counterpartNum].username
                    }` || '',
                  ownerExtension: conv.owner,
                })
                store.dispatch.island.setIslandView('call')

                eventDispatch('phone-island-call-ringing', {})
              }
              break
            // @ts-ignore
            case 'busy':
              if (
                (uaType === 'mobile' && hasOnlineNethlink()) ||
                (uaType === 'desktop' &&
                  (default_device?.type === 'webrtc' ||
                    (default_device?.type === undefined && !hasOnlineNethlink()) ||
                    (!hasOnlineNethlink() && default_device?.type === 'physical')))
              ) {
                if (conv && conv.connected) {
                  // Current call accepted and update connected call
                  dispatch.currentCall.updateCurrentCall({
                    conversationId: conv.id,
                    displayName: getDisplayName(conv),
                    number: `${conv.counterpartNum}`,
                    ownerExtension: conv.owner,
                    username:
                      `${
                        extensions &&
                        extensions[conv.counterpartNum] &&
                        extensions[conv.counterpartNum].username
                      }` || '',
                    chDest: conv?.chDest || {},
                    chSource: conv?.chSource || {},
                  })
                  // Update the current call informations for physical devices
                  dispatch.currentCall.checkAcceptedUpdate({
                    acceptedSocket: true,
                  })
                  // Add call to transfer calls
                  dispatch.currentCall.addTransferCalls({
                    type: 'transferred',
                    displayName: getDisplayName(conv),
                    number: `${conv.counterpartNum}`,
                    startTime: `${getTimestampInSeconds()}`,
                  })

                  if (isPhysical()) {
                    checkDefaultDeviceConversationActive(conv)
                  }
                  if (view === 'call' && transferring) {
                    dispatch.currentCall.updateCurrentCall({
                      transferring: false,
                    })
                  }
                }
                // Delete transfer calls if there are more than one ( in case of call switch after transfer)
                if (transferCalls.length > 1) {
                  dispatch.currentCall.deleteTransferCalls()
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
                      eventDispatch('phone-island-call-transfer-failed', {})
                      // Reset transfer switching
                      // TODO - It needs to enhance how conversation connections (conv.connected) are updated server side
                      // TODO - The transfer end is not handled when the an user hangups or after call switch
                      dispatch.currentCall.updateTransferSwitching(false)
                    }
                  }
                  if (conv?.counterpartName === 'REC') {
                    dispatch.physicalRecorder.setRecordingTempVariable(true)
                  }
                }
                // Handle outgoing call
                if (conv && !conv.connected && conv.direction === 'out') {
                  // Update the current outgoing conversation
                  dispatch.currentCall.checkOutgoingUpdate({
                    outgoingSocket: true,
                    outgoing: conv?.counterpartName === 'REC' ? false : true,
                    displayName: getDisplayName(conv),
                    number: `${conv?.counterpartNum}`,
                    username:
                      `${
                        extensions &&
                        extensions[conv?.counterpartNum] &&
                        extensions[conv?.counterpartNum].username
                      }` || '',
                  })
                }
              }
              break

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
            case 'busy_ringing':
              eventDispatch('phone-island-call-ringing', {})
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
          dispatch.physicalRecorder.setRecordingTempVariable(false)
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

      // save websocket to store
      dispatch.websocket.update({ socket: socket.current })

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
              eventDispatch('phone-island-socket-disconnected-popup-close', {})
            },
            () => {
              // Set socket_down alert
              dispatch.alerts.setAlert('socket_down')
              eventDispatch('phone-island-socket-disconnected-popup-open', {})
              console.error('Socket is unreachable!')
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
          uaType: uaType,
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

      socket.current.on('extenHangup', (res: any) => {
        const { endpoints } = store.getState().currentUser

        // Get user extensions
        const userExtensions = endpoints?.extension || []

        // Find the extension type based on callerNum
        const connectedExtension = userExtensions.find((ext) => ext.id === res.callerNum)
        const extensionType: any = connectedExtension?.type

        // If cause is normal_clearing and extension is physical or mobile
        // Clean phone-island visibility also after user_busy ( useful for physical devices )
        if (
          (res.cause === 'normal_clearing' &&
            (extensionType === 'physical' || extensionType === 'mobile')) ||
          res?.cause === 'user_busy' ||
          res?.cause === 'not_defined' ||
          res?.cause === 'call_rejected'
        ) {
          // Reset phone island visibility after 2 seconds to avoid glitches
          setTimeout(() => {
            store.dispatch.island.toggleAvoidToShow(false)
          }, 500)
        }
      })

      // Avoid to show phone island if call is connected with other extension
      socket.current.on('extenConnected', (res: { extenConnected: string }) => {
        // Get the current user's extensions

        const { default_device, endpoints } = store.getState().currentUser
        const userExtensions = endpoints?.extension || []

        // Find the extension type
        const connectedExtension = userExtensions.find((ext) => ext.id === res.extenConnected)
        const extensionType: any = connectedExtension?.type

        // Reset only if the extension type is not webrtc or nethlink
        // ( avoid to not show phone island if default is physical and extensionType is physical)
        if (
          ((default_device?.type === 'webrtc' || default_device?.type === 'nethlink') &&
            extensionType &&
            (extensionType === 'mobile' || extensionType === 'physical')) ||
          (default_device?.type === 'physical' && extensionType && extensionType !== 'physical')
        ) {
          // Avoid to show phone island in case of answer from physical or mobile device
          store.dispatch.island.toggleAvoidToShow(true)
          // Launch an event to advert the user that the call it's answered from another device
          eventDispatch('phone-island-call-answered', { extensionType })
        }
      })

      socket.current.on('extenUpdate', (res: ExtensionTypes) => {
        // Update extensions and conversations in users store
        dispatch.users.updateExtension(res)

        //retrieve all extensions from store
        const { extensions }: any = store.getState().users
        const deviceMap: any = {}

        // Create a map of extensions for each user
        for (const key in extensions) {
          const user: any = extensions[key].username
          const ext: any = extensions[key].exten

          if (!deviceMap[user]) {
            deviceMap[user] = []
          }

          deviceMap[user].push(ext)
        }

        const associatedExtensions: any = deviceMap[res.username]

        // Initialize conversation
        let conv = res.conversations[Object.keys(res.conversations)[0]] || {}

        // Update all extensions and send the dispatch event
        dispatchExtensions(res)

        // second step update conversation

        // Check if conversation is empty
        if (isEmpty(conv)) {
          // Check if there is at least one conversation not empty
          const hasNonEmptyConversation = associatedExtensions?.some((ext: any) => {
            const extConversations = extensions[ext]?.conversations

            if (!isEmpty(extConversations)) {
              // not empty conversation found
              return true
            }

            return false
          })

          if (!hasNonEmptyConversation) {
            // Conversation is empty and there is no conversation for the user
            dispatchConversations(res)
          }
        } else {
          // Dispatch conversation event
          dispatchConversations(res)
        }

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

      // `actionNethLink` is the socket event when user make a call or a action from NethLink and has a physical device
      socket.current.on('actionNethLink', (link, urlType) => {
        // Dispatch phone island physical call event with the link and the urlType
        dispatchUrlCall(link, urlType)
      })

      // `screenSharingStart` is the socket event when a user starts screen sharing
      socket.current.on('message', (data: any) => {
        switch (data.message) {
          case 'screenSharingStart':
            dispatchJoinScreenShare(data as ScreenSharingMessage)
            break
          case 'screenSharingStop':
            dispatchLeaveScreenShare(data as ScreenSharingMessage)
            break
          default:
            console.warn('Socket: unknown message type ', data.message)
        }
      })

      // `updateDefaultDevice` is the socket event when user change the default device
      socket.current.on('updateDefaultDevice', (extension: string) => {
        // Dispatch phone island physical call event with the link and the urlType
        dispatchDefaultDeviceUpdate(extension)
        // Update the internal store
        const { extensions } = store.getState().users
        const { endpoints } = store.getState().currentUser
        if (!extensions || !endpoints) return

        const extensionInformations: any = Object.values(extensions).filter(
          (ext) => ext?.exten === extension,
        )
        if (extensionInformations.length === 0) return

        let objectComplete = extensionInformations[0]
        const endpointExtension = endpoints.extension.find(
          (endpoint) => endpoint.id === objectComplete.exten,
        )
        if (endpointExtension) {
          objectComplete = { ...objectComplete, type: endpointExtension.type }
        }

        store.dispatch.currentUser.updateCurrentDefaultDevice(objectComplete)
      })

      socket.current.on('confBridgeUpdate', (res: any) => {
        if (res && res?.users) {
          // Get User informations
          const conferenceId = res?.id
          const conferenceUsers = res?.users

          store.dispatch.conference.updateConferenceUsersList(conferenceUsers)

          store.dispatch.conference.updateConferenceId(conferenceId)
        }
      })

      socket.current.on('confBridgeEnd', (res: any) => {
        if (res && res?.id) {
          // Reset the conference store when conference ends
          store.dispatch.conference.resetConference()
          eventDispatch('phone-island-conference-finished', {})
        }
      })

      socket.current.on('callWebrtc', (res: any) => {
        // On call event from socket dispatch the call start event
        eventDispatch('phone-island-call-start', { number: res })
        // TODO - Add the change view logic
        // setTimeout(() => {
        //   store.dispatch.island.setIslandView('waitingConference')
        // }, 1000)
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
