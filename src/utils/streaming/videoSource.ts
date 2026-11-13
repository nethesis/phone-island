// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { VideoSourceGateType, VideoSourceKind, VideoSourceType } from '../../models/streaming'

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
 * Video source associated with an extension (the counterpart number of the call)
 */
export const findVideoSourceByNumber = (
  videoSources: Record<string, VideoSourceType> | undefined | null,
  number: string | undefined | null,
): VideoSourceType | undefined => {
  if (!videoSources || !number) return undefined
  return Object.values(videoSources).find((source) => source?.extension === number)
}
