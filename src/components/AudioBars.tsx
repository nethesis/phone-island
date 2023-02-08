// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useEffect, useRef, useCallback } from 'react'

// Swapping values around for a better visual effect
const DATA_MAP = {
  0: 4,
  1: 3,
  2: 2,
  3: 1,
  4: 1,
  5: 2,
  6: 3,
  7: 4,
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

  const connectStream = useCallback(
    (audioStream: MediaStream) => {
      // Initialize and audio context
      // @ts-ignore
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create and audio contest analyser
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(audioStream)

      // Connect the analyser to the audio source
      source.connect(analyser)

      // Set smooth constant
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

          // Select the bars array
          const bars = containerElement.current?.children

          // Change styles to every bar
          for (let i = 0; i < Object.keys(DATA_MAP).length; ++i) {
            const value = values[DATA_MAP[i]] / 255
            // @ts-ignore
            const barStyles = bars && bars[i].style
            if (barStyles) {
              // Set height to every bar
              barStyles.height = `${100 * value}%`
            }
          }
          requestAnimationFrame(renderFrame)
        })
      }

      // Render the frames using requestAnimationFrame API
      requestAnimationFrame(renderFrame)
    },
    [audioStream],
  )

  useEffect(() => {
    if (audioStream) {
      // Initialize audio bars
      connectStream(audioStream)
    }
  }, [audioStream])

  return (
    <div className='h-12 w-12 flex justify-center items-center'>
      <div
        className='h-8 w-fit flex justify-center items-center gap-1 overflow-hidden'
        ref={containerElement}
      >
        {audioStream &&
          Object.keys(DATA_MAP).map((key) => <div key={key} className='bg-emerald-600 w-0.5 opacity-90'></div>)}
      </div>
    </div>
  )
})
