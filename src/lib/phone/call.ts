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
import { store } from '../../store'
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
} from '../../services/astproxy'
import dtmfAudios from '../../static/dtmf'
import { hangupConversation, parkConversation } from '../../services/astproxy'
import { eventDispatch } from '../../utils'
import { isEmpty } from '../../utils/genericFunctions/isEmpty'

/**
 * Starts a call to a number
 * @param number The number string
 */
export function callNumber(number: string, sipHost: string) {
  const sipURI = `sip:${number}@${sipHost}`
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

/**
 * Hangup current call
 */
export function hangupCurrentCall() {
  const { outgoing, accepted } = store.getState().currentCall
  if (outgoing || accepted) {
    if (isWebRTC()) {
      hangup()
    } else {
      hangupPhysical()
    }
    store.dispatch.player.stopAudioPlayer()
    store.dispatch.currentCall.reset()
    store.dispatch.listen.reset()
  }
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

          // Play the remote audio element
          store.dispatch.player.playRemoteAudio()

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
