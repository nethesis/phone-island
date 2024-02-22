// Copyright (C) 2022 Nethesis S.r.l.
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
  unmutePhysical,
  pausePhysical,
  callPhysical,
} from '../../services/astproxy'
import dtmfAudios from '../../static/dtmf'
import { hangupConversation, parkConversation } from '../../services/astproxy'
import { eventDispatch } from '../../utils'

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

  eventDispatch('phone-island-call-answered', {})
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

    eventDispatch('phone-island-call-end', {})
  }
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
    mutePhysical()
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
    unmutePhysical()
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
