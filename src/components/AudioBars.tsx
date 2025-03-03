// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef, useCallback } from 'react'
import { ContextSourceType } from '../models/audioBars'
import { useDispatch } from 'react-redux'
import { store } from '../store'
import { Dispatch } from '../store'

// The map for the large versione of the audio bars
const BARS_CONFIG = {
  large: {
    0: 4,
    1: 3,
    2: 2,
    3: 1,
    4: 1,
    5: 2,
    6: 3,
    7: 4,
  },
  // The map for the small versione of the audio bars

  small: {
    0: 2,
    1: 1,
    2: 1,
    3: 2,
  },
}

interface AudioBarsProps {
  audioStream?: MediaStream | null
  audioElement?: HTMLAudioElement | null
  size?: 'large' | 'small'
  paused?: boolean
}

interface BarsMapType {
  [key: number]: number
}

/**
 * This component shows a dynamic audio spectrum given an audio stream
 *
 * @param audioStream An audio stream to analyse
 * @param audioElement An audio element to analyse
 */
export const AudioBars: FC<AudioBarsProps> = ({
  audioStream = null,
  audioElement = null,
  paused = false,
  size = 'large',
}) => {
  // Initialize the main elements
  const containerElement = useRef<HTMLDivElement | null>(null)
  const animationRequest = useRef<number | null>(null)
  const context = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const source = useRef<ContextSourceType>(null)

  const barsMap: BarsMapType = BARS_CONFIG[size]
  const dispatch = useDispatch<Dispatch>()

  // The function that renders the frames of animation
  const animate = useCallback(() => {
    if (!analyser.current || !containerElement.current?.children) {
      return
    }

    try {
      const frequencyData = new Uint8Array(analyser.current.frequencyBinCount)
      analyser.current.getByteFrequencyData(frequencyData)
      // Update the height of each bar based on frequency data
      const bars = containerElement.current.children
      const barCount = Object.keys(barsMap).length

      for (let i = 0; i < barCount; ++i) {
        const value = frequencyData[barsMap[i]] / 255
        const bar = bars[i] as HTMLElement

        if (bar) {
          bar.style.height = value > 0 ? `${100 * value}%` : '0%'
        }
      }

      // Continue animation if not paused
      if (!paused) {
        animationRequest.current = requestAnimationFrame(animate)
      }
    } catch (err) {
      console.error('AudioBars animation error:', err)
    }
  }, [barsMap, paused])

  // Handles audio configuration and animation
  useEffect(() => {
    // Clean up any previous animations
    const cleanupAnimation = () => {
      if (animationRequest.current) {
        cancelAnimationFrame(animationRequest.current)
        animationRequest.current = null
      }
    }

    // Disconnect audio source if it exists
    const disconnectSource = () => {
      if (source.current) {
        try {
          source.current.disconnect()
        } catch (e) {
          // Ignore disconnection errors
        }
      }
    }

    // Check if audio stream is active
    if (audioStream && !audioStream.active) {
      console.warn('AudioBars: audio stream is not active')
      return cleanupAnimation
    }

    try {
      const { audioElementContext, audioElementAnalyser, audioElementSource, isReady } =
        store.getState().audioBars

      // Initialize audio context and analyser once
      if (audioElement && isReady) {
        // The source is an audio element
        context.current = audioElementContext
        analyser.current = audioElementAnalyser
        source.current = audioElementSource
      } else {
        // The source is an audio stream or isn't ready
        context.current = new AudioContext()
        analyser.current = context.current.createAnalyser()
        analyser.current.smoothingTimeConstant = 0.8
        analyser.current.fftSize = 32

        // Create the media source stream
        if (audioStream) {
          source.current = context.current.createMediaStreamSource(audioStream)
        } else if (audioElement) {
          source.current = context.current.createMediaElementSource(audioElement)

          // Save audio elements to the store
          dispatch.audioBars.setAudioElementContext(context.current)
          dispatch.audioBars.setAudioElementAnalyser(analyser.current)
          dispatch.audioBars.setAudioElementSource(source.current)
          dispatch.audioBars.setIsReady(true)
        }
      }

      // Connect the audio source to the analyser
      if (analyser.current && source.current) {
        // Disconnect any existing connections
        disconnectSource()

        // Connect source -> analyser (-> destination if it's an audio element)
        source.current.connect(analyser.current)
        if (audioElement) {
          analyser.current.connect(context.current!.destination)
        }

        // Start animation if not paused
        if (!paused) {
          cleanupAnimation()
          animationRequest.current = requestAnimationFrame(animate)
        }
      }
    } catch (err) {
      console.error('AudioBars initialization error:', err)
      cleanupAnimation()
    }

    // Cleanup when component is unmounted
    return () => {
      cleanupAnimation()
      disconnectSource()
    }
  }, [audioStream, audioElement, animate, dispatch.audioBars, paused])

  // Handle paused state or size changes
  useEffect(() => {
    if (analyser.current) {
      // Stop current animation
      if (animationRequest.current) {
        cancelAnimationFrame(animationRequest.current)
        animationRequest.current = null
      }

      // Restart if not paused
      if (!paused) {
        animationRequest.current = requestAnimationFrame(animate)
      }
    }
  }, [size, paused, animate])

  return (
    <div
      className={`${
        size === 'small' ? 'pi-h-6 pi-w-6' : 'pi-h-12 pi-w-12'
      } pi-flex pi-justify-center pi-items-center`}
    >
      {/* The bars container  */}
      <div
        className={`${
          size === 'small' ? 'pi-h-6' : 'pi-h-8'
        } pi-w-fit pi-flex pi-justify-center pi-items-center pi-gap-1 pi-overflow-hidden`}
        ref={containerElement}
      >
        {/* Every single bar */}
        {(audioStream || audioElement) &&
          Object.keys(barsMap).map((key) => (
            <span
              key={key}
              className='pi-bg-emerald-700 dark:pi-bg-emerald-600 pi-w-0.5 pi-rounded-sm'
            ></span>
          ))}
      </div>
    </div>
  )
}
