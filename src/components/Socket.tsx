// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../store'
import { io } from 'socket.io-client'
import { getApiMode } from './RestAPI'
import { getDisplayName } from '../lib/phone/conversation'
import { getCurrentUserInfo } from '../services/user'
import busyRingtone from '../static/busy_ringtone'
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
} from '../events'
import { store } from '../store'
import { eventDispatch, useEventListener, withTimeout } from '../utils'
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
import { checkMediaPermissions } from '../lib/devices/devices'
import { isFromStreaming } from '../utils/streaming/isFromStreaming'
import { getStreamingSourceId } from '../utils/streaming/getStreamingSourceId'
import { subscribe } from '../services/user'
import { isFromTrunk } from '../lib/user/extensions'

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
  const isUpdatingUserInfo = useRef(false)

  // get user information
  const userInformation = useSelector((state: RootState) => state.currentUser)

  // Event listener for starting transcription
  useEventListener('phone-island-start-transcription', () => {
    if (socket.current) {
      socket.current.emit('start_transcription', {})
    }
  })

  // Event listener for stopping transcription
  useEventListener('phone-island-stop-transcription', () => {
    if (socket.current) {
      socket.current.emit('stop_transcription', {})
    }
  })

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
     * Helper function to handle streaming source detection and subscription
     */
    const handleStreamingSource = (conv: ConversationTypes) => {
      // Check if the call is from a streaming source
      if (conv.counterpartNum && isFromStreaming(conv.counterpartNum)) {
        // Set isFromStreaming flag to true
        dispatch.island.setIsFromStreaming(true)

        // Store the streaming source number in the currentCall state for future reference
        dispatch.currentCall.updateCurrentCall({
          streamingSourceNumber: conv.counterpartNum,
        })

        // Find the source ID and subscribe to streaming updates
        const sourceId = getStreamingSourceId(conv.counterpartNum)
        if (sourceId) {
          // Subscribe to streaming updates
          subscribe({ id: sourceId }).catch((error) =>
            console.error('Error subscribing to streaming source:', error),
          )
        }
      }
    }

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
              // Handle streaming source for incoming calls
              handleStreamingSource(conv)

              if (
                (uaType === 'mobile' && hasOnlineNethlink()) ||
                (uaType === 'desktop' &&
                  (default_device?.type === 'webrtc' ||
                    (default_device?.type === undefined && !hasOnlineNethlink()) ||
                    (!hasOnlineNethlink() && default_device?.type === 'physical')))
              ) {
                // Get updated user info
                if (!isUpdatingUserInfo.current) {
                  isUpdatingUserInfo.current = true
                  getCurrentUserInfo()
                    .then((userInfo) => {
                      if (userInfo) {
                        dispatch.currentUser.updateCurrentUser(userInfo)
                        eventDispatch('phone-island-user-informations-update', { ...userInfo })
                        if (userInfo.settings && userInfo.settings.open_param_url) {
                          dispatch.paramUrl.setOpenParamUrlType(userInfo.settings.open_param_url)
                        } else {
                          dispatch.paramUrl.setOpenParamUrlType('never')
                        }
                      }
                    })
                    .catch((error) => {
                      console.error('Error getting current user info:', error)
                    })
                    .finally(() => {
                      setTimeout(() => {
                        isUpdatingUserInfo.current = false
                      }, 100)
                    })
                }
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
                let callInformations = {
                  conversationId: conv.id,
                  displayName: getDisplayName(conv),
                  counterpartNum: `${conv.counterpartNum}`,
                  ownerExtension: conv.owner,
                  username:
                    `${
                      extensions &&
                      extensions[conv.counterpartNum] &&
                      extensions[conv.counterpartNum].username
                    }` || '',
                  chDest: conv?.chDest || {},
                  chSource: conv?.chSource || {},
                  direction: conv.direction,
                  inConference: conv.inConference,
                  linkedId: conv.linkedId,
                  uniqueId: conv.uniqueId,
                  throughQueue: conv.throughQueue,
                  throughTrunk: conv.throughTrunk,
                  recording: conv.recording,
                }
                store.dispatch.island.setIslandView('call')

                eventDispatch('phone-island-call-ringing', {})
                const { openParamUrlType } = store.getState().paramUrl
                const { urlOpened } = store.getState().island

                if (openParamUrlType === 'ringing' && !urlOpened) {
                  // Calculate throughTrunk based on counterpartNum
                  const calculatedThroughTrunk = isFromTrunk(conv.counterpartNum)

                  // Update throughTrunk in paramUrl store
                  store.dispatch.paramUrl.setThroughTrunk(calculatedThroughTrunk)

                  store.dispatch.island.setUrlOpened(false)
                  eventDispatch('phone-island-url-parameter-opened', {
                    counterpartNum: conv.counterpartNum,
                    counterpartName: getDisplayName(conv),
                    owner: conv.owner,
                    uniqueId: conv.uniqueId,
                    throughQueue: conv.throughQueue,
                    throughTrunk: calculatedThroughTrunk,
                    direction: conv.direction,
                    connected: conv.connected,
                  })
                }
              }
              break
            // @ts-ignore
            case 'busy':
              // Handle streaming source for outgoing calls
              handleStreamingSource(conv)

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

                  // Check if this is a streaming call that was accepted
                  const { isFromStreaming } = store.getState().island
                  if (isFromStreaming && conv.direction === 'out') {
                    // Set view to streamingAnswer for outgoing streaming calls when accepted
                    setTimeout(() => {
                      dispatch.island.setIslandView('streamingAnswer')
                    }, 200)
                  }

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
          // Reset isFromStreaming flag
          dispatch.island.setIsFromStreaming(false)
        }
      }
    }

    /**
     * Initialize socket connection and listeners
     */
    const initSocketConnection = () => {
      const currentApiMode = getApiMode(username)

      const socketOptions: any = {
        upgrade: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
      }

      // Only set path for new API mode
      if (currentApiMode === 'new') {
        socketOptions.path = '/api/ws'
      }

      socket.current = io('https://' + hostName, socketOptions)

      // save websocket to store
      dispatch.websocket.update({ socket: socket.current })

      // Handle socket errors
      socket.current.on('connect', () => {
        console.debug(`Socket connected sid: ${socket.current.id}`)
        eventDispatch('phone-island-socket-connected', {})
      })
      socket.current.on('disconnect', (reason) => {
        console.debug(`Socket disconnect - reason: ${reason}`)
        // Clear the connection check interval on disconnect to avoid stale pings
        if (connectionCheckInterval.current) {
          clearInterval(connectionCheckInterval.current)
          connectionCheckInterval.current = null
        }
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

      // Connection check interval is now started in the authe_ok handler
      // to ensure it only runs after successful authentication

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
        eventDispatch('phone-island-socket-authorized', {})

        // Start connection check interval after successful authentication
        // Clear any existing interval first to avoid duplicates
        if (connectionCheckInterval.current) {
          clearInterval(connectionCheckInterval.current)
        }
        connectionCheckInterval.current = setInterval(() => {
          socket.current.volatile.emit(
            'ping',
            withTimeout(
              () => {
                // Remove socket_down alert (async to avoid React error #300 with framer-motion)
                setTimeout(() => {
                  dispatch.alerts.removeAlert('socket_down')
                  eventDispatch('phone-island-alert-removed', {
                    type: 'socket_down',
                  })
                  eventDispatch('phone-island-socket-disconnected-popup-close', {})
                }, 0)
              },
              () => {
                // Set socket_down alert (async to avoid React error #300 with framer-motion)
                // Only set alert if socket is actually disconnected (avoid race condition during reconnection)
                setTimeout(() => {
                  if (!socket.current.connected) {
                    dispatch.alerts.setAlert('socket_down')
                    eventDispatch('phone-island-socket-disconnected-popup-open', {})
                    console.error('Socket is unreachable!')
                  } else {
                    console.debug('Socket ping timeout but socket is connected, skipping alert')
                  }
                }, 0)
              },
              5 * 1000,
            ),
          )
        }, 5 * 1000)
      })

      socket.current.on('userMainPresenceUpdate', (res: MainPresenceTypes) => {
        // Update endpoints store
        store.dispatch.users.updateEndpointMainPresence({ ...res.mainPresence })
        // Dispatch dispatchMainPresence Event
        dispatchMainPresence(res)
      })

      socket.current.on('extenHangup', (res: any) => {
        const { endpoints, username } = store.getState().currentUser
        const { isActive, conferenceStartedFrom } = store.getState().conference
        const { view, previewCallFromMobileOrNethlink } = store.getState().island

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
          (res.cause === 'normal_clearing' &&
            (extensionType === 'webrtc' || extensionType === 'nethlink') &&
            previewCallFromMobileOrNethlink) ||
          res?.cause === 'user_busy' ||
          res?.cause === 'not_defined' ||
          res?.cause === 'call_rejected' ||
          res?.cause === 'interworking'
        ) {
          // Reset phone island visibility after 2 seconds to avoid glitches
          setTimeout(() => {
            store.dispatch.island.toggleAvoidToShow(false)
            store.dispatch.island.setPreviewCallFromMobileOrNethlink(false)
          }, 500)
          // Only reset conference if there are no more participants or if user is not in a conference
          if (isActive && conferenceStartedFrom !== username) {
            store.dispatch.conference.resetConference()
          }
        } else if (
          res?.cause === 'normal_circuit_congestion' &&
          isActive &&
          conferenceStartedFrom === username
        ) {
          setTimeout(() => {
            eventDispatch('phone-island-view-changed', { viewType: 'waitingConference' })
          }, 800)
        } else if (
          (res.cause === 'normal_clearing' ||
            res?.cause === 'user_busy' ||
            res?.cause === 'not_defined' ||
            res?.cause === 'call_rejected') &&
          (extensionType === 'webrtc' || extensionType === 'nethlink') &&
          isActive &&
          conferenceStartedFrom !== username
        ) {
          store.dispatch.conference.resetConference()
        }
        // if conference owner and added participant refuses or hangs up with normal_clearing
        if (
          ((res.cause === 'normal_clearing' &&
            (extensionType === 'webrtc' || extensionType === 'nethlink')) ||
            res?.cause === 'call_rejected') &&
          isActive &&
          conferenceStartedFrom === username
        ) {
          const { usersList, pendingUsers } = store.getState().conference
          // Check if there are still participants in the conference (both confirmed and pending)
          const hasConfirmedParticipants = usersList && Object.keys(usersList).length > 0
          const hasPendingParticipants = pendingUsers && Object.keys(pendingUsers).length > 0
          const hasParticipants = hasConfirmedParticipants || hasPendingParticipants

          if (!hasParticipants) {
            store.dispatch.conference.resetConference()
          } else {
            // If there are still participants, keep the waitingConference view
            setTimeout(() => {
              eventDispatch('phone-island-view-changed', { viewType: 'waitingConference' })
            }, 800)
          }
        }
        // if conference owner call the call with the added user inside conference
        if (
          res?.cause === 'interworking' &&
          isActive &&
          conferenceStartedFrom === username &&
          view !== 'waitingConference'
        ) {
          setTimeout(() => {
            eventDispatch('phone-island-view-changed', { viewType: 'waitingConference' })
          }, 800)
        }
        if (res?.cause === 'user_busy') {
          // Get current user's extensions
          const { endpoints, username } = store.getState().currentUser
          const userExtensions = endpoints?.extension || []
          const userExtensionIds = userExtensions.map((ext) => ext.id)

          // Get the current call state to understand if we're the caller or receiver
          const { incoming, outgoing } = store.getState().currentCall

          // Check if there's an active conference
          const { isActive, conferenceStartedFrom } = store.getState().conference

          // When we RECEIVE a call on our extension, callerNum is the busy extension (our own)
          // When we CALL someone, channelExten is one of our extensions (the one we're calling from)
          const isReceivingCall = incoming && userExtensionIds.includes(res.callerNum)

          // Only show operator busy view if:
          // 1. We are NOT receiving an incoming call to our own extension
          if (!isReceivingCall) {
            // Set operator busy active with caller information
            store.dispatch.island.setOperatorBusyActive({
              callerNumber: res.callerNum || 'Unknown',
            })

            // Stop busy tone after 4 seconds
            setTimeout(() => {
              store.dispatch.player.stopAudioPlayer()
            }, 4000)

            setTimeout(() => {
              // Play busy tone
              store.dispatch.player.updateStartAudioPlayer({
                src: busyRingtone,
                loop: true,
              })
              store.dispatch.island.setIslandView('operatorBusy')
            }, 600)

            // If conference is active and we're the owner, return to conference after timeout
            if (isActive && conferenceStartedFrom === username) {
              setTimeout(() => {
                eventDispatch('phone-island-view-changed', { viewType: 'waitingConference' })
              }, 4000)
            }
          }
        }

        // Handle subscriber_absent - when added participant rejects the call
        if (res?.cause === 'subscriber_absent') {
          const { isActive, conferenceStartedFrom } = store.getState().conference
          const { username } = store.getState().currentUser

          // Only handle if conference is active and current user is the owner
          if (isActive && conferenceStartedFrom === username) {
            // Check if there are still participants in the conference (both confirmed and pending)
            const { usersList, pendingUsers } = store.getState().conference
            const hasConfirmedParticipants = usersList && Object.keys(usersList).length > 0
            const hasPendingParticipants = pendingUsers && Object.keys(pendingUsers).length > 0
            const hasParticipants = hasConfirmedParticipants || hasPendingParticipants

            if (hasParticipants) {
              // Return to waiting conference view to manage other participants
              setTimeout(() => {
                eventDispatch('phone-island-view-changed', { viewType: 'waitingConference' })
              }, 800)
              // Remove from pending users if exists
              if (pendingUsers && pendingUsers[res.callerNum]) {
                store.dispatch.conference.removePendingUser(res.callerNum)
              }
            } else {
              // No participants left, reset conference
              store.dispatch.conference.resetConference()
            }
          }
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
          // Set the preview call flag
          store.dispatch.island.setPreviewCallFromMobileOrNethlink(true)
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

        const userInformation = store.getState().currentUser
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

        // Check if this is a mobile extension call for the current user
        let isMobileExtensionCall = false
        if (res?.username === username && !isEmpty(conv) && conv?.owner) {
          const matchingExtension = userInformation?.endpoints?.extension?.find(
            (ext: any) => ext.id === conv.owner,
          )
          if (matchingExtension && matchingExtension.type === 'mobile') {
            isMobileExtensionCall = true
          }
        }

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
        } else if (!isMobileExtensionCall) {
          // Dispatch conversation event
          dispatchConversations(res)
        }

        if (isMobileExtensionCall && res?.status === 'busy' && res?.username === username) {
          store.dispatch.island.toggleAvoidToShow(true)
          store.dispatch.island.setPreviewCallFromMobileOrNethlink(true)
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

      // `parkingUpdate` is the socket event when a call is parked or unparked
      socket.current.on('parkingUpdate', (event) => {
        // Dispatch parking update event with the parking information
        dispatchParkingUpdate(event)
      })

      // `actionNethLink` is the socket event when user make a call or a action from NethLink and has a physical device
      socket.current.on('actionNethLink', (link, urlType) => {
        // Dispatch phone island physical call event with the link and the urlType
        dispatchUrlCall(link, urlType)
      })

      socket.current.on('message', (data: any) => {
        switch (data.message) {
          case 'screenSharingStart':
            dispatch.island.toggleSideViewVisible(false)
            dispatch.island.toggleTranscriptionViewVisible(false)
            dispatch.island.setIslandView('video')

            dispatch.screenShare.update({
              isJoiningScreenShare: true,
              room: (data as ScreenSharingMessage).roomId,
            })
            break
          case 'screenSharingStop':
            dispatch.island.toggleSideViewVisible(false)
            dispatch.island.toggleTranscriptionViewVisible(false)
            dispatch.island.setIslandView('video')

            dispatch.screenShare.update({
              isLeavingScreenShare: true,
            })
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
        //make sure to check the media permissions
        checkMediaPermissions()
      })

      socket.current.on('confBridgeUpdate', (res: any) => {
        if (res && res?.users) {
          // Get User informations
          const conferenceId = res?.id
          const conferenceUsers = res?.users

          // Get current users list to preserve mute status
          const { usersList } = store.getState().conference

          // Create a copy of the new conference users while preserving mute status
          const updatedConferenceUsers = { ...conferenceUsers }

          // Preserve mute status for existing users
          if (usersList) {
            Object.keys(updatedConferenceUsers).forEach((userId) => {
              if (usersList[userId]) {
                // Keep the existing mute status instead of using the server's value
                updatedConferenceUsers[userId] = {
                  ...updatedConferenceUsers[userId],
                  muted: usersList[userId].muted,
                }
              }
            })
          }

          store.dispatch.conference.updateConferenceUsersList(updatedConferenceUsers)
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
      })

      socket.current.on('newVoiceMessageCounter', (res: any) => {
        eventDispatch('phone-island-voicemail-received', { voicemailInfo: res })
      })

      socket.current.on('streamingSourceUpdate', (res: any) => {
        eventDispatch('phone-island-streaming-information-received', { res })
        const streamingData = res.streaming || (res.res && res.res.streaming)

        if (streamingData) {
          const { source, image } = streamingData
          if (source && image) {
            const { isFromStreaming } = store.getState().island
            const { streamingSourceNumber } = store.getState().currentCall
            const sourceId = getStreamingSourceId(streamingSourceNumber)

            dispatch.streaming.updateSourceImage({
              source: source,
              image: image,
            })
          }
        }
      })

      // Handle satellite/transcription messages
      socket.current.on('satellite/transcription', (transcriptionData: any) => {
        // Dispatch the transcription event to external listeners
        eventDispatch('phone-island-conversation-transcription', transcriptionData)
      })
    }

    initSocketConnection()

    // Stop the check socket interval
    // Close the socket connection
    return () => {
      clearInterval(connectionCheckInterval.current)
      socket.current.close()
    }
  }, [hostName, username, authToken, uaType, dispatch])

  // Manage reload events
  useEffect(() => {
    if (reload) {
      console.info('Socket reload requested')
      const { data } = store.getState().alerts
      const { forceReload } = store.getState().island

      // Check if socket is actually down using alerts (more reliable than socket.connected)
      const isSocketDown = data.socket_down?.active || false

      // Only reconnect if socket_down alert is active OR force reload is requested
      if (isSocketDown || forceReload) {
        console.info(
          forceReload
            ? 'Force reload requested, performing Socket reconnection'
            : 'Socket down detected (alert active), performing reconnection'
        )
        // Reset force reload flag
        if (forceReload) {
          store.dispatch.island.setForceReload(false)
        }
        // Clear the connection check interval to avoid stale ping timeouts during reconnection
        if (connectionCheckInterval.current) {
          clearInterval(connectionCheckInterval.current)
          connectionCheckInterval.current = null
        }
        // Disconnect and reconnect socket
        setTimeout(() => {
          socket.current.disconnect()
          socket.current.connect()
          // Execute the reloaded callback
          reloadedCallback()
        }, 100)
      } else {
        console.info('Socket already connected (no alert active), skipping reconnection')
        // Execute callback without reload
        reloadedCallback()
      }
    }
  }, [reload])

  return <>{children}</>
}
