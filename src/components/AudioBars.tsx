// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef } from 'react'

const large = {
  0: 4,
  1: 3,
  2: 2,
  3: 1,
  4: 1,
  5: 2,
  6: 3,
  7: 4,
}

const small = {
  0: 2,
  1: 1,
  2: 1,
  3: 2,
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
  size,
}) => {
  // Initialize the main elements
  const containerElement = useRef<HTMLDivElement | null>(null)
  const animationRequest = useRef<number | null>(null)
  const barsMap: BarsMapType = size === 'large' ? large : small
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const source = useRef<ContextSourceType>(null)

  function saveAnimationRequest(requestId: number) {
    if (requestId) {
      animationRequest.current = requestId
    }
  }

  function startAnimation() {
    const animationRequestId: number = requestAnimationFrame(animationFrame)
    saveAnimationRequest(animationRequestId)
  }

  // The function that renders the frames of animation
  function animationFrame() {
    if (analyser && analyser.current) {
      const frequencyData = new Uint8Array(analyser.current.frequencyBinCount)
      analyser.current.getByteFrequencyData(frequencyData)
      const values = Object.values(frequencyData)

      const bars = containerElement.current?.children
      if (bars && bars?.length > 0) {
        // Change styles to every bar
        for (let i = 0; i < Object.keys(barsMap).length; ++i) {
          const value = values[barsMap[i]] / 255
          // @ts-ignore
          const barStyles = bars && bars[i] && bars[i].style
          if (barStyles && value > 0) {
            barStyles.height = `${100 * value}%`
          }
        }
        startAnimation()
      }
    }
  }

  useEffect(() => {
    // Initialize audio context and analyser once
    audioContext.current = new AudioContext()
    analyser.current = audioContext.current.createAnalyser()
    analyser.current.smoothingTimeConstant = 0.8
    analyser.current.fftSize = 32

    if (audioStream) {
      // The source is an audio stream
      source.current = audioContext.current.createMediaStreamSource(audioStream)
    } else if (audioElement) {
      // The source is an audio element
      source.current = audioContext.current.createMediaElementSource(audioElement)
    }

    // Connect the audio source to the analyser
    source.current && source.current.connect(analyser.current)
    analyser.current && analyser.current.connect(audioContext.current.destination)

    startAnimation()

    // Cleanup bars animation
    return () => {
      animationRequest.current && cancelAnimationFrame(animationRequest.current)
      source.current?.disconnect()
      analyser.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (animationRequest.current) {
      cancelAnimationFrame(animationRequest.current)
      startAnimation()
    }
  }, [size])

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
            <span key={key} className='pi-bg-emerald-600 pi-w-0.5 pi-rounded-sm'></span>
          ))}
      </div>
    </div>
  )
}

interface AudioBarsProps {
  audioStream?: MediaStream | null
  audioElement?: HTMLAudioElement | null
  size?: 'large' | 'small'
}

type ContextSourceType = MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null

interface BarsMapType {
  [key: number]: number
}
