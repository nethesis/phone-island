// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useEffect, useRef } from 'react'

// Swapping values around for a better visual effect
const DATA_MAP = {
  0: 8,
  1: 7,
  2: 6,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 1,
  8: 1,
  9: 2,
  10: 3,
  11: 4,
  12: 5,
  13: 6,
  14: 7,
  15: 8,
}

interface AudioBarsProps {
  audioStream: MediaStream | null
}

/**
 * This component shows a dynamic audio spectrum given an audio stream
 *
 * @param audioStream The audio stream to analyse
 *
 */

export const AudioBars = React.memo<AudioBarsProps>(({ audioStream }) => {
  // The container element ref
  const containerElement = useRef<HTMLDivElement | null>(null)

  const connectStream = (audioStream: MediaStream) => {
    // Initialize and audio context
    const audioContext = new AudioContext()
    // Create and audio contest analyser
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(audioStream)
    // Connect the analyser to the audio source
    source.connect(analyser)
    // The smooth constant
    analyser.smoothingTimeConstant = 0.8
    // The fftzize to be applied on the stream
    analyser.fftSize = 32

    // The function that renders the frames
    const renderFrame = () => {
      requestIdleCallback(() => {
        // Find the frequency
        const frequencyData = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(frequencyData)
        const values = Object.values(frequencyData)
        const barsElements = containerElement.current?.children
        for (let i = 0; i < Object.keys(DATA_MAP).length; ++i) {
          const value = values[DATA_MAP[i]] / 255
          // @ts-ignore
          const elmStyles = barsElements && barsElements[i].style
          if (elmStyles) {
            // Set styles to every bar
            elmStyles.transform = `scaleY( ${value * 6} )`
            elmStyles.opacity = `0.85`
          }
        }
        requestAnimationFrame(renderFrame)
      })
    }
    requestAnimationFrame(renderFrame)
  }

  useEffect(() => {
    if (audioStream !== null) {
      // Initialize audio bars
      connectStream(audioStream)
    }
  }, [audioStream])

  return (
    <>
      <div
        className='flex justify-center items-center gap-0.5 h-12 w-12 -mt-1.5'
        ref={containerElement}
      >
        {audioStream &&
          Object.keys(DATA_MAP).map((key) => (
            <div key={key} className='w-1 h-1 bg-emerald-600 inline-block'></div>
          ))}
      </div>
    </>
  )
})
