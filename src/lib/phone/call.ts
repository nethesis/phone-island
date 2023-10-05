// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getSupportedDevices } from '../devices/devices'
import Janus from '../webrtc/janus'
import {
  call,
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
} from '../../services/astproxy'
import dtmfAudios from '../../static/dtmf'
import { hangupConversation, parkConversation } from '../../services/astproxy'

/**
 * Starts a call to a number
 * @param number The number string
 */
export function callNumber(number: string, sipHost: string) {
  const sipURI = `sip:${number}@${sipHost}`
  callSipURI(sipURI)
}

/**
 * Starts a call to a SIP URI
 *
 * @param sipURI The SIP URI string
 */
export function callSipURI(sipURI: string) {
  getSupportedDevices(async () => {
    // @ts-ignore
    Janus.log('This is a SIP call')
    await call(sipURI, {
      audio: {
        mandatory: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          googNoiseReduction: true,
          volume: 1.0,
        },
      },
      audioSend: true,
      audioRecv: true,
      videoSend: false,
      videoRecv: false,
    })
  })
}

/**
 * Answer incoming call
 */
export function answerIncomingCall() {
  if (isWebRTC()) {
    answerWebRTC()
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
    hangup()
  }
  store.dispatch.player.stopAudioPlayer()
  store.dispatch.currentCall.reset()
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
  }
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
  }
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
  }
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
  }
}

/**
 * Transfer the current call through a blind transfer (not in use)
 */
export async function blindTransfer(number: string) {
  // Retrieve current conversation info
  const { conversationId } = store.getState().currentCall
  const { default_device } = store.getState().currentUser
  // Transfer the call through blind transfer
  if (conversationId && default_device?.id && number) {
    return await blindTransferRequest({
      convid: conversationId,
      to: number,
      endpointId: default_device.id,
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
  // Transfer the call through attended transfer
  if (conversationId && default_device?.id && number) {
    return await attendedTransferRequest({
      convid: conversationId,
      to: number,
      endpointId: default_device.id,
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

export function park() {
  const conversationId = store?.getState()?.currentCall?.conversationId

  if (conversationId) {
    let conversationIdSplitted = conversationId.split('>')
    let firstConversationIdSplitted = conversationIdSplitted[0]
    let firstConversationIdNumber: any = ''
    let secondConversationIdSplitted = conversationIdSplitted[1]
    let secondConversationIdNumber: any = ''
    let firstNumberToCheck: any = ''
    let secondNumberToCheck: any = ''

    let isCallInQueue = false
    // Check if call id contains @from-queue
    if (firstConversationIdSplitted.includes('@from-queue')) {
      // Remove @from-queue
      firstConversationIdSplitted = firstConversationIdSplitted.replace('@from-queue', '')
      // Remove all the caracter except for extension number
      firstConversationIdSplitted = firstConversationIdSplitted.replace(/\/(\d+)-\d+;.*/, '$1')
      firstConversationIdNumber = firstConversationIdSplitted?.match(/(\d+)/)
      isCallInQueue = true
    } else {
      firstConversationIdNumber = firstConversationIdSplitted?.match(/\/(\d+)-/)
    }

    if (firstConversationIdNumber !== undefined) {
      firstNumberToCheck = firstConversationIdNumber[1]
    }

    // Check if call id contains @from-queue
    if (secondConversationIdSplitted.includes('@from-queue')) {
      // Remove @from-queue
      secondConversationIdSplitted = secondConversationIdSplitted.replace('@from-queue', '')
      // Remove all the caracter except for extension number
      secondConversationIdSplitted = secondConversationIdSplitted.replace(/\/(\d+)-\d+;.*/, '$1')
      secondConversationIdNumber = secondConversationIdSplitted?.match(/(\d+)/)
      isCallInQueue = true
    } else {
      secondConversationIdNumber = secondConversationIdSplitted?.match(/\/(\d+)-/)
    }

    if (secondConversationIdNumber !== undefined) {
      secondNumberToCheck = secondConversationIdNumber[1]
    }

    // If call is not from queue
    if (!isCallInQueue) {
      const endpoints: any = store?.getState()?.currentUser?.endpoints

      if (Array.isArray(endpoints.extension)) {
        // Get id from extensions
        const extensionIds = endpoints.extension.map((endpoint) => endpoint.id)
        if (extensionIds.indexOf(firstConversationIdNumber[1]) !== -1) {
          const endpointId = firstConversationIdNumber[1]
          parkConversation({
            applicantId: endpointId,
            convid: conversationId,
            endpointId: endpointId,
          })
        } else if (extensionIds.indexOf(secondConversationIdNumber[1]) !== -1) {
          const endpointId = secondConversationIdNumber[1]
          parkConversation({
            applicantId: endpointId,
            convid: conversationId,
            endpointId: endpointId,
          })
        }
      }
      // If call is from queue
    } else {
      // Get user informations from store
      const userInformations = store?.getState()?.users

      if (userInformations?.extensions) {
        // Get keys of conversations not empty
        const currentUserConversationsKeys = Object.keys(
          store.getState().currentUser.conversations,
        ).filter((key) => Object.keys(store.getState().currentUser.conversations[key]).length > 0)

        // Check number to get corresponding extension with not empty conversation object
        const matchingNumbers: any = [firstNumberToCheck, secondNumberToCheck].filter((number) => {
          return currentUserConversationsKeys.includes(number)
        })

        if (matchingNumbers.length > 0) {
          const endpointId = matchingNumbers[0]
          parkConversation({
            applicantId: endpointId,
            convid: conversationId,
            endpointId: endpointId,
          })
        }
      }
    }
  }
}
