// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  callSipURI,
  hangup,
  answerWebRTC,
  muteWebRTC,
  unmuteWebRTC,
  pauseWebRTC,
  unpauseWebRTC,
} from '../webrtc/messages'
import { Dispatch, store } from '../../store'
import { isWebRTC } from '../user/default_device'
import {
  blindTransfer as blindTransferRequest,
  attendedTransfer as attendedTransferRequest,
  hangupPhysical,
  answerPhysical,
  mutePhysical,
  pausePhysical,
  callPhysical,
  toggleRecord,
  hangupPhysicalRecordingCall,
  startConf,
  joinMyConf,
  endConf,
  muteUserConf,
  unmuteUserConf,
  hangupUserConf,
  forceHangup,
} from '../../services/astproxy'
import dtmfAudios from '../../static/dtmf'
import { hangupConversation, parkConversation } from '../../services/astproxy'
import { eventDispatch } from '../../utils'
import { isEmpty } from '../../utils/genericFunctions/isEmpty'
import { getStreamingSourceId } from '../../utils/streaming/getStreamingSourceId'
import { unsubscribe } from '../../services/user'

/**
 * Starts a call to a number
 * @param number The number string
 */
export function callNumber(number: string, sipHost: string) {
  const sipURI = `sip:${number}@${sipHost}`

  // Reset any previous operator busy state when starting a new call
  store.dispatch.island.resetOperatorBusy()
  // Save the called number for potential operator busy scenarios
  store.dispatch.island.setOperatorBusyCalledNumber(number)

  if (isWebRTC()) {
    callSipURI(sipURI)
  } else {
    callPhysical(number)
  }

  eventDispatch('phone-island-call-started', {})
}

/**
 * Answer incoming call
 */
export function answerIncomingCall() {
  if (isWebRTC()) {
    answerWebRTC()
  } else {
    answerPhysical()
  }
  // Reset operator busy completely when call is answered successfully
  store.dispatch.island.resetOperatorBusyCompletely()
}

/**
 * Hangup all the conversations of all the extensions of the current user
 */
export function hangupAllExtensions() {
  // Get current user endpoints
  const { conversations } = store.getState().currentUser
  // Hangup all the conversations of all extensions of the current user
  for (const extension in conversations) {
    const conversationsIds = Object.keys(conversations[extension])
    conversationsIds.forEach((id) => {
      hangupConversation({
        convid: id,
        endpointId: extension,
      })
    })
  }
}

export function forceHangupConversation() {
  // Get current user endpoints
  const { conversations } = store.getState().currentUser
  // Hangup all the conversations of all extensions of the current user
  for (const extension in conversations) {
    const conversationsIds = Object.keys(conversations[extension])
    conversationsIds.forEach((id) => {
      forceHangup({
        convid: id,
        endpointId: extension,
        endpointType: 'extension',
      })
    })
  }
}

/**
 * Hangup current call
 */
export function hangupCurrentCall() {
  const { outgoing, accepted, streamingSourceNumber } = store.getState().currentCall
  const { isFromStreaming } = store.getState().island

  if (outgoing || accepted) {
    if (isWebRTC()) {
      hangup()
    } else {
      hangupPhysical()
    }
    store.dispatch.player.stopAudioPlayer()
    store.dispatch.currentCall.reset()
    store.dispatch.listen.reset()

    // If call was from a streaming source, unsubscribe and clear images
    if (isFromStreaming && streamingSourceNumber) {
      const sourceId = getStreamingSourceId(streamingSourceNumber)
      if (sourceId) {
        // Unsubscribe from streaming updates
        unsubscribe({ id: sourceId })
          .then(() => console.debug(`Unsubscribed from streaming source: ${sourceId}`))
          .catch((error) => console.error('Error unsubscribing from streaming source:', error))

        // Clear source images to free up memory
        store.dispatch.streaming.clearSourceImages()
      }
    }

    // Reset isFromStreaming flag
    store.dispatch.island.setIsFromStreaming(false)
  }
  // Reset operator busy state when call ends
  store.dispatch.island.resetOperatorBusy()
  // Caller close the call before the call is accepted
  eventDispatch('phone-island-call-ended', {})
}

/**
 * Hangup current physical recording
 */
export function hangupCurrentPhysicalRecording() {
  hangupPhysicalRecordingCall()
  store.dispatch.player.stopAudioPlayer()
  store.dispatch.physicalRecorder.reset()
  store.dispatch.physicalRecorder.setRecording(false)
  store.dispatch.island.setIslandView(null)
  store.dispatch.listen.reset()
  // Caller close the call before the call is accepted
  eventDispatch('phone-island-call-ended', {})
}

/**
 * Mute the current call
 */
export function muteCurrentCall() {
  // Check the current user default device
  if (isWebRTC()) {
    const muted = muteWebRTC()
    if (muted) {
      store.dispatch.currentCall.updateCurrentCall({
        muted: true,
      })
    }
  } else {
    mutePhysical(true)
  }
  eventDispatch('phone-island-call-muted', {})
}

/**
 * Unmute the current call
 */
export function unmuteCurrentCall() {
  // Check the current user default device
  if (isWebRTC()) {
    const unmuted = unmuteWebRTC()
    if (unmuted) {
      store.dispatch.currentCall.updateCurrentCall({
        muted: false,
      })
    }
  } else {
    mutePhysical(false)
  }
  eventDispatch('phone-island-call-unmuted', {})
}

/**
 * Pause the current call
 */
export function pauseCurrentCall() {
  // Check the current user default device
  if (isWebRTC()) {
    const paused = pauseWebRTC()
    if (paused) {
      store.dispatch.currentCall.updateCurrentCall({
        paused: true,
      })
      // Pause remote audio
      store.dispatch.player.pauseRemoteAudio()
    }
  } else {
    pausePhysical(true)
  }
  eventDispatch('phone-island-call-held', {})
}

/**
 * Unpause the current call
 */
export function unpauseCurrentCall() {
  // Check the current user default device
  if (isWebRTC()) {
    const unpaused = unpauseWebRTC()
    if (unpaused) {
      store.dispatch.currentCall.updateCurrentCall({
        paused: false,
      })
      // Play remote audio
      store.dispatch.player.playRemoteAudio()
    }
  } else {
    pausePhysical(false)
  }
  eventDispatch('phone-island-call-unheld', {})
}

/**
 * Transfer the current call through a blind transfer (not in use)
 */
export async function blindTransferFunction(number: string, endpointIdInConversation: string) {
  // Retrieve current conversation info
  const { conversationId } = store.getState().currentCall
  // Transfer the call through blind transfer
  if (conversationId && endpointIdInConversation && number) {
    return await blindTransferRequest({
      convid: conversationId,
      to: number,
      endpointId: endpointIdInConversation,
    })
  }
}

/**
 * Transfer the current call through a attended transfer
 */
export async function attendedTransfer(number: string) {
  // Retrieve current conversation info
  const { conversationId } = store.getState().currentCall
  const { default_device } = store.getState().currentUser
  let default_device_details = default_device?.id || default_device?.exten
  // Transfer the call through attended transfer
  if (conversationId && default_device_details && number) {
    return await attendedTransferRequest({
      convid: conversationId,
      to: number,
      endpointId: default_device_details,
    })
  }
}

/**
 * Play the dtmf audio files
 */
export function playDtmfAudio(key: string) {
  if (key === '*') key = 'star'
  if (key === '#') key = 'pound'
  store.dispatch.player.updateStartAudioPlayer({ src: dtmfAudios[`dtmf_${key}`] })
}

/**
 * Park the current call
 */
export function parkCurrentCall() {
  const conversationId = store?.getState()?.currentCall?.conversationId
  const userConversationInformations = store?.getState()?.currentUser?.conversations

  let parkingInformation: any = {}

  if (conversationId) {
    if (userConversationInformations) {
      for (const key in userConversationInformations) {
        if (userConversationInformations.hasOwnProperty(key)) {
          const conversation = userConversationInformations[key]
          if (Object.keys(conversation).length > 0) {
            parkingInformation = {
              numberParkId: key,
              idConversation: conversationId,
            }
          }
        }
      }
    }

    if (Object.keys(parkingInformation).length > 0) {
      if (parkingInformation?.numberParkId) {
        // If park information are not empty park call
        parkConversation({
          applicantId: parkingInformation?.numberParkId,
          convid: conversationId,
          endpointId: parkingInformation?.numberParkId,
        })

        store.dispatch.currentCall.setParked(true)

        eventDispatch('phone-island-call-parked', {})
      }
    }
  }
}

const findFirstExtesnionNotEmpty = (data) => {
  for (const key in data) {
    if (Object.keys(data[key]).length !== 0) {
      const firstEntry: any = Object.values(data[key])[0]
      return {
        id: firstEntry.id,
        recording: firstEntry.recording,
      }
    }
  }
  return null
}

export async function recordCurrentCall(recordingValue: boolean) {
  store.dispatch.currentCall.updateRecordingStatus(!recordingValue)
  const userConversationInformations = store?.getState()?.currentUser?.conversations

  const firstExtensionNotEmpty = findFirstExtesnionNotEmpty(userConversationInformations)

  if (!firstExtensionNotEmpty) {
    return
  } else {
    const numberToSendCall = firstExtensionNotEmpty?.id?.match(/\/(\d+)-/)
    const endpointId = numberToSendCall[1]

    const listenInformations = {
      convid: firstExtensionNotEmpty?.id?.toString(),
      endpointId: endpointId?.toString(),
    }

    let recordingValues = ''
    switch (firstExtensionNotEmpty?.recording) {
      case 'false':
        recordingValues = 'start_record'
        break
      case 'true':
        recordingValues = 'mute_record'
        break
      case 'mute':
        recordingValues = 'unmute_record'
        break
      default:
        recordingValues = ''
        break
    }

    if (listenInformations) {
      try {
        await toggleRecord(recordingValues, listenInformations)
      } catch (e) {
        console.error(e)
        return []
      }
    }
  }
}

export async function startConference() {
  const {
    accepted,
    chSource,
    chDest,
    incoming,
    outgoing,
    incomingSocket,
    outgoingSocket,
    conversationId,
  }: any = store?.getState()?.currentCall
  const { default_device } = store.getState().currentUser
  const defaultDeviceId = default_device?.id || default_device?.exten
  let addedUserExtension = ''
  if (accepted && (incoming || incomingSocket) && !isEmpty(chSource)) {
    addedUserExtension = chSource?.callerNum
  } else if (accepted && (outgoing || outgoingSocket) && !isEmpty(chDest)) {
    addedUserExtension = chDest?.callerNum
  }

  if (defaultDeviceId !== '' && conversationId !== '' && addedUserExtension !== '') {
    const startConferenceInformations = {
      convid: conversationId?.toString(),
      addEndpointId: addedUserExtension?.toString(),
      ownerEndpointId: defaultDeviceId?.toString(),
    }

    if (startConferenceInformations) {
      try {
        const result = await startConf(startConferenceInformations)
        if (result) {
          // Set conferencing and disable pause
          store.dispatch.currentCall.updateCurrentCall({
            conferencing: true,
            paused: false,
          })

          eventDispatch('phone-island-call-conferenced', {})
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    }
  }
  return false
}

export async function joinConference() {
  const { default_device } = store.getState().currentUser
  const defaultDeviceId = default_device?.id || default_device?.exten

  if (defaultDeviceId !== '') {
    const joinConferenceInformation = {
      endpointId: defaultDeviceId?.toString(),
    }

    if (joinConferenceInformation) {
      try {
        const result = await joinMyConf(joinConferenceInformation)
        if (result) {
          eventDispatch('phone-island-owner-conference-enter', {})
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    }
  }
  return false
}

export async function endConference() {
  const { conferenceId } = store.getState().conference

  if (conferenceId !== '') {
    const endConferenceInformation = {
      confId: conferenceId?.toString(),
    }

    if (endConferenceInformation) {
      try {
        const result = await endConf(endConferenceInformation)
        if (result) {
          eventDispatch('phone-island-owner-conference-finished', {})
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    }
  }
  return false
}

export async function muteUserConference(confId, userId, isAlreadyMuted) {
  if (confId === '' || userId === '') {
    return false
  }

  const muteUnmuteUserInformation = {
    confId: confId?.toString(),
    userId: userId?.toString(),
  }

  try {
    // Check if the user is already muted
    const actionFunction = isAlreadyMuted ? unmuteUserConf : muteUserConf
    const result = await actionFunction(muteUnmuteUserInformation)
    return !!result
  } catch (e) {
    console.error(e)
    return false
  }
}

export async function muteAllUsersConference(confId, isAlreadyMuted) {
  if (confId === '') {
    return false
  }

  // Get the conference users from the store
  const { usersList } = store.getState().conference

  if (!usersList || Object.keys(usersList).length === 0) {
    return false
  }

  try {
    // Iterate through all users (except the owner) and mute/unmute them
    const nonOwnerUsers = Object.values(usersList)

    // Determine which function to use based on isAlreadyMuted
    const actionFunction = isAlreadyMuted ? unmuteUserConf : muteUserConf

    // For each user, call the appropriate function directly
    for (const user of nonOwnerUsers) {
      const muteUnmuteUserInformation = {
        confId: confId?.toString(),
        userId: user.id?.toString(),
      }

      const result = await actionFunction(muteUnmuteUserInformation)

      if (result) {
        store.dispatch.conference.toggleUserMuted({
          extenId: user.extenId,
          muted: !isAlreadyMuted,
        })
      }
    }

    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export async function removeUserConference(conferenceId, extensionId) {
  if (conferenceId !== '' && extensionId !== '') {
    const removeUserInformation = {
      confId: conferenceId?.toString(),
      extenId: extensionId?.toString(),
    }

    if (removeUserInformation) {
      try {
        const result = await hangupUserConf(removeUserInformation)
        if (result) {
          // Check if this was the last participant (excluding owner)
          setTimeout(async () => {
            const { usersList } = store.getState().conference
            const remainingParticipants = Object.values(usersList || {}).filter(
              (user) => !user.owner && user.extenId !== extensionId,
            ).length

            // If no more participants left, end the conference
            if (remainingParticipants === 0) {
              await endConference()
            }
          }, 500)

          return true
        }

        return false
      } catch (e) {
        console.error(e)
        return false
      }
    }
  }
  return false
}

export const clickTransferOrConference = async (number: string, dispatch: Dispatch) => {
  if (isInsideConferenceList()) {
    const { isActive } = store.getState().conference

    // Put current call user inside conference mode (only for first user to add not for the second one)
    // If conference is not active, start it first, otherwise proceed directly
    if (!isActive) {
      const conferenceStarted = await startConference()
      if (!conferenceStarted) {
        return // Early return if conference failed to start
      }
    }

    // Proceed to waiting conference view (common path for both cases)
    waitingConferenceView(number, dispatch)
  } else {
    handleAttendedTransfer(number, dispatch)
  }
}

export const isInsideConferenceList = () => {
  const { isConferenceList } = store.getState().island
  if (isConferenceList) {
    return true
  }
  return false
}

export const waitingConferenceView = (numberToCall, dispatch: Dispatch) => {
  // Get all required state in one call to minimize store access
  const state = store.getState()
  const { username } = state.currentUser
  const { isActive, isOwnerInside, conferenceId } = state.conference
  const { extensions } = state.users

  // Show current waiting user in back view (only on first)
  if (!isActive && username) {
    dispatch.conference.setConferenceActive(true)
    dispatch.conference.setConferenceStartedFrom(username)
  }

  // Add pending user to track the participant being added (before socket confirms)
  const extension = extensions
    ? Object.values(extensions).find((ext: any) => ext.exten === numberToCall)
    : null
  const extensionName = extension?.name || numberToCall

  dispatch.conference.addPendingUser({
    id: `${conferenceId}-${numberToCall}`,
    name: extensionName,
    owner: false,
    muted: false,
    extenId: numberToCall,
    joinTime: Date.now(),
  })

  // If owner has already started the conference, hangup before making a new call
  if (isOwnerInside) {
    hangupCurrentCall()
    dispatch.conference.toggleIsOwnerInside(false)
  }

  // Start new call with selected user from conference list
  // Use requestAnimationFrame to ensure state updates are complete before dispatching event
  requestAnimationFrame(() => {
    setTimeout(() => {
      eventDispatch('phone-island-call-start', { number: numberToCall })
    }, 800)
  })
}

export async function handleAttendedTransfer(number: string, dispatch: Dispatch) {
  // Send attended transfer message
  unpauseCurrentCall()
  const transferringMessageSent = await attendedTransfer(number)
  if (transferringMessageSent) {
    // Set transferring and disable pause
    dispatch.currentCall.updateCurrentCall({
      transferring: true,
      paused: false,
    })

    // Use requestAnimationFrame to ensure state update is complete before audio operations
    requestAnimationFrame(() => {
      dispatch.player.playRemoteAudio()
      eventDispatch('phone-island-call-transfered', {})
    })
  }
}
