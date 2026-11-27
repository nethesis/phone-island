// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { VideoSourceGateType, VideoSourceKind, VideoSourceType } from '../../models/streaming'
import type { ConversationTypes, ExtensionsTypes, UsersEndpointsTypes } from '../../types'
import { getCounterpartDeviceExten } from '../../lib/phone/counterpartDevice'

/**
 * Kind of a video source: older servers send no type and only have image sources
 */
export const getVideoSourceKind = (source?: VideoSourceType | null): VideoSourceKind =>
  source?.type === 'rtsp' ? 'rtsp' : 'image'

export const isRtspVideoSource = (source?: VideoSourceType | null): boolean =>
  getVideoSourceKind(source) === 'rtsp'

/**
 * Gates of a video source. Older servers send no gates list: a non-empty cmdOpen is then a
 * single implicit gate (opened by the server default, so no gate id is sent), a DTMF one.
 */
export const getVideoSourceGates = (source?: VideoSourceType | null): VideoSourceGateType[] => {
  if (!source) return []
  if (Array.isArray(source.gates)) {
    return source.gates.filter((gate) => gate && gate.id !== undefined && gate.id !== null)
  }
  if (source.cmdOpen && source.cmdOpen.trim() !== '') {
    return [{ id: '', name: source.description || '', type: 'dtmf' }]
  }
  return []
}

/**
 * True for a gate opened by DTMF tones sent by the PBX into the call with the video source
 * extension: the tones get lost until the call is answered.
 */
export const isDtmfGate = (gate?: VideoSourceGateType | null): boolean => gate?.type === 'dtmf'

/**
 * Video source associated with a number: the extension of its device first, otherwise the main
 * extension of the user of the device (a door phone 91242 of the user 242 calls as 242), only
 * when a single source has it (two door phones of the same user cannot be told apart)
 */
export const findVideoSourceByNumber = (
  videoSources: Record<string, VideoSourceType> | undefined | null,
  number: string | undefined | null,
): VideoSourceType | undefined => {
  if (!videoSources || !number) return undefined
  const sources = Object.values(videoSources)
  const exact = sources.find((source) => source?.extension === number)
  if (exact) return exact
  const byMain = sources.filter(
    (source) => !!source?.mainExtension && source.mainExtension === number,
  )
  return byMain.length === 1 ? byMain[0] : undefined
}

/**
 * Video source of a call: the device of the counterpart, when the channels tell it, must be the
 * device of the source (a call from the desk phone of the user of a door phone is a normal
 * call); otherwise (an outgoing call still ringing) the counterpart number
 */
export const findVideoSourceForConversation = (
  videoSources: Record<string, VideoSourceType> | undefined | null,
  conv: ConversationTypes | undefined | null,
  users: { extensions: ExtensionsTypes | null; endpoints: UsersEndpointsTypes | null },
): VideoSourceType | undefined => {
  if (!videoSources || !conv?.counterpartNum) return undefined
  const device = getCounterpartDeviceExten(conv, users)
  if (device) {
    return Object.values(videoSources).find((source) => source?.extension === device)
  }
  return findVideoSourceByNumber(videoSources, `${conv.counterpartNum}`)
}
