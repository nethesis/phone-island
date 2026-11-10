// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

export type VideoSourceKind = 'image' | 'rtsp'

export interface VideoSourceGateType {
  id: string
  name: string
  // how the server opens the gate ("dtmf", "url", ...): a "dtmf" gate needs an answered call
  type?: string
}

export interface VideoSourceType {
  cmdOpen: string
  description: string
  // null when the source is not associated with an extension
  extension: string | null
  frameRate: string
  id: string
  password: string
  url: string
  user: string
  image?: string
  // "image": JPEG frames pushed through the websocket, "rtsp": live WebRTC video (WHEP).
  // Missing on older servers, which only have image sources.
  type?: VideoSourceKind
  // WHEP path of the video gateway (rtsp sources only), null for image sources
  whep?: string | null
  // gates that can be opened, missing on older servers (see getVideoSourceGates)
  gates?: VideoSourceGateType[]
}

interface StreamingStateType {
  videoSources: Record<string, VideoSourceType>
  sourceImages: Record<string, string>
  // width / height of the picture of each source, once known (sizes the call views)
  aspectRatios: Record<string, number>
  // the gate chooser of the ringing call view is open (the island makes room for it)
  gateChooserOpen: boolean
}

const defaultState: StreamingStateType = {
  videoSources: {},
  sourceImages: {},
  aspectRatios: {},
  gateChooserOpen: false,
}

export const streaming = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateVideoSources: (state, payload: Record<string, VideoSourceType>) => {
      return {
        ...state,
        videoSources: payload,
      }
    },
    updateSourceImage: (state, payload: { source: string; image: string }) => {
      const sourceId = payload.source

      const updatedSourceImages = {
        ...state.sourceImages,
        [sourceId]: payload.image,
      }

      const updatedVideoSources = { ...state.videoSources }

      if (Object.values(updatedVideoSources).some((source) => source.id === sourceId)) {
        Object.keys(updatedVideoSources).forEach((key) => {
          if (updatedVideoSources[key].id === sourceId) {
            updatedVideoSources[key] = {
              ...updatedVideoSources[key],
              image: payload.image,
            }
          }
        })
      }

      return {
        ...state,
        sourceImages: updatedSourceImages,
        videoSources: updatedVideoSources,
      }
    },
    setSourceAspectRatio: (state, payload: { source: string; aspectRatio: number }) => {
      const { source, aspectRatio } = payload
      if (!source || !isFinite(aspectRatio) || aspectRatio <= 0) return state
      // ignore rounding noise: the island is resized only on a real change
      const current = state.aspectRatios[source]
      if (current && Math.abs(current - aspectRatio) < 0.01) return state
      return {
        ...state,
        aspectRatios: { ...state.aspectRatios, [source]: aspectRatio },
      }
    },
    setGateChooserOpen: (state, payload: boolean) => {
      if (state.gateChooserOpen === payload) return state
      return {
        ...state,
        gateChooserOpen: payload,
      }
    },
    clearSourceImages: (state) => {
      return {
        ...state,
        sourceImages: {},
      }
    },
    reset: () => {
      return defaultState
    },
  },
})
