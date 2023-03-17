// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useEffect, useRef } from 'react'

// Swapping values around for a better visual effect
const LARGE_MAP = {
  0: 4,
  1: 3,
  2: 2,
  3: 1,
  4: 1,
  5: 2,
  6: 3,
  7: 4,
}

const SMALL_MAP = {
  0: 2,
  1: 1,
  2: 1,
  3: 2,
}

interface AudioBarsProps {
  audioStream: MediaStream | null
  size?: 'large' | 'small'
}

/**
 * This component shows a dynamic audio spectrum given an audio stream
 *
 * @param audioStream The audio stream to analyse
 *
 */

export const AudioBars = React.memo<AudioBarsProps>(({ audioStream, size = 'large' }) => {
  // The container element ref
  const containerElement = useRef<HTMLDivElement | null>(null)

  // The variable that stops
  // const [pause, setPause] = useState<boolean>(false)

  const animationRequest = useRef<any>(null)
  const stopped = useRef<any>(null)

  // Initialize DATA_MAP depending on size
  const dataMap: { [key: number]: number } = size === 'large' ? LARGE_MAP : SMALL_MAP

  const connectStream = (audioStream: MediaStream) => {
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
      // Return if was stopped and not
      if (stopped.current) {
        return
      }
      // Find the frequency
      const frequencyData = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(frequencyData)
      const values = Object.values(frequencyData)

      // Select the bars array
      const bars = containerElement.current?.children
      if (bars && bars?.length > 0) {
        // Change styles to every bar
        for (let i = 0; i < Object.keys(dataMap).length; ++i) {
          const value = values[dataMap[i]] / 255
          // @ts-ignore
          const barStyles = bars && bars[i] && bars[i].style
          if (barStyles && value > 0) {
            // Set height to every bar
            barStyles.height = `${100 * value}%`
          }
        }
        const requestId: number = requestAnimationFrame(renderFrame)
        if (requestId) {
          animationRequest.current = requestId
        }
      }
    }

    // Render the frames using requestAnimationFrame API
    const requestId: number = requestAnimationFrame(renderFrame)
    if (requestId) {
      animationRequest.current = requestId
    }
  }

  // The function that startAnimations
  function startAnimation(callback?: () => void) {
    if (audioStream) {
      // Initialize audio bars
      connectStream(audioStream)
    }
    stopped.current = false
    // Execute the callback
    callback && callback()
  }

  // The function that stopAnimations
  function stopAnimation(callback?: () => void) {
    if (animationRequest.current) {
      // Initialize audio bars
      cancelAnimationFrame(animationRequest.current)
    }
    stopped.current = true
    // Execute the callback
    callback && callback()
  }

  // Handle size change
  useEffect(() => {
    stopAnimation(() => {
      startAnimation()
    })
  }, [size])

  // Handle audio stream
  useEffect(() => {
    stopAnimation(() => {
      startAnimation()
    })
  }, [audioStream])

  // Cleanup animation
  useEffect(() => {
    return () => {
      stopAnimation()
    }
  }, [])

  return (
    <div
      className={`${size === 'small' ? 'pi-h-6 pi-w-6' : 'pi-h-12 pi-w-12'} pi-flex pi-justify-center pi-items-center`}
    >
      {/* The bars container  */}
      <div
        className={`${
          size === 'small' ? 'pi-h-6' : 'pi-h-8'
        } pi-w-fit pi-flex pi-justify-center pi-items-center pi-gap-1 pi-overflow-hidden`}
        ref={containerElement}
      >
        {/* Every single bar */}
        {audioStream &&
          Object.keys(dataMap).map((key) => (
            <span key={key} className='pi-bg-emerald-600 pi-w-0.5 pi-rounded-sm'></span>
          ))}
      </div>
    </div>
  )
})
