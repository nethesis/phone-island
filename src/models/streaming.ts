// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface VideoSourceType {
  cmdOpen: string
  description: string
  extension: string
  frameRate: string
  id: string
  password: string
  url: string
  user: string
  image?: string
}

interface StreamingStateType {
  videoSources: Record<string, VideoSourceType>
  sourceImages: Record<string, string>
}

const defaultState: StreamingStateType = {
  videoSources: {},
  sourceImages: {},
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
