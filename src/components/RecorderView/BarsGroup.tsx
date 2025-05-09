// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef, useCallback, useState } from 'react'
import { Bar } from './Bar'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'

// The number in percent of the width of the group bars
// ...by which the leftward transaction occurs
// ...so it defines the speed of the animation
const BARS_ANIMATION_SPEED: number = 0.4
// The number of bars to be shown for for every group
// ...it defines the lenght of every group
const BARS_COUNT: number = 55
// A value that rapresents the window size in samples
// ...that is used when performing a fast fourier transform
// ...to get frequency domain data
// ...a higher number result in more details in frequency and fewer in amplitude
const AUDIO_FFT_VALUE: number = 32

function getTranslateXPercent(element: HTMLDivElement) {
  const transformValue = element.style.transform
  const translateXMatch = transformValue.match(/translateX\(([-0-9.]+)%\)/)
  if (translateXMatch && translateXMatch[1]) {
    return parseFloat(translateXMatch[1])
  }
  return 0
}

export const BarsGroup: FC<BarsGroupProps> = ({ index, startAnimation, audioStream }) => {
  const barsContainerRef = useRef<HTMLDivElement>(null)
  const animationRequestRef = useRef<number>(0)
  const lastTranslateRef = useRef<number>(0)
  const visibleContainerRef = useSelector((state: RootState) => state.recorder.visibleContainerRef)
  const dispatch = useDispatch<Dispatch>()
  const analyser = useRef<AnalyserNode | null>(null)
  const [showBars, setShowBars] = useState<boolean>()

  // The animation of the bars groups
  const barsGroupAnimation = useCallback(() => {
    if (barsContainerRef.current) {
      // Retrieve the last translate value
      const lastTranslateValue = lastTranslateRef.current
        ? lastTranslateRef.current
        : getTranslateXPercent(barsContainerRef.current)
      // Calculate the new translate value
      const newTranslateValue = lastTranslateValue - BARS_ANIMATION_SPEED
      const finalTranslateValue = newTranslateValue <= -100 ? 100 : newTranslateValue
      barsContainerRef.current.style.transform = `translateX(${finalTranslateValue}%)`
      // Update the translate ref value
      lastTranslateRef.current = finalTranslateValue
    }
    animationRequestRef.current = requestAnimationFrame(barsGroupAnimation)
  }, [lastTranslateRef])

  function retrieveFrequency() {
    const frequencyData = analyser.current && new Uint8Array(analyser.current.frequencyBinCount)
    frequencyData && analyser.current?.getByteFrequencyData(frequencyData)
    const values = (frequencyData && Object.values(frequencyData)) || []
    // Save the higher frequency to recorder state
    // ...using a number from 0 to 1
    dispatch.recorder.setFrequency(values[0] / 255)
    requestAnimationFrame(retrieveFrequency)
  }

  // Retrieve frequency
  useEffect(() => {
    if (audioStream) {
      const context = new AudioContext()
      analyser.current = context.createAnalyser()
      analyser.current.fftSize = AUDIO_FFT_VALUE
      // Connect the source to the analyser
      const source = audioStream && context.createMediaStreamSource(audioStream)
      // Connect the audio source to the analyser
      source.connect(analyser.current)
      // Request the animation to perform
      requestAnimationFrame(retrieveFrequency)
    }
  }, [audioStream])

  // Manage animation start
  useEffect(() => {
    if (startAnimation) {
      animationRequestRef.current = requestAnimationFrame(barsGroupAnimation)
    }
    return () => {
      animationRequestRef.current && cancelAnimationFrame(animationRequestRef.current)
    }
  }, [startAnimation])

  useEffect(() => {
    if (barsContainerRef?.current) {
      setShowBars(true)
    }
  }, [])

  return (
    <div
      id={`${index}`}
      style={{
        transform: `translateX(${100 * index}%)`,
      }}
      className='pi-absolute pi-flex pi-w-fit pi-h-6 pi-gap-1 pi-items-center pi-px-0.5'
      ref={barsContainerRef}
    >
      {/* Create a custom number of bars */}
      {showBars && (
        <>
          {Array.from(Array(BARS_COUNT).keys()).map((_, i) => (
            <Bar key={i} visibleContainer={visibleContainerRef?.current || null} />
          ))}
        </>
      )}
    </div>
  )
}

interface BarsGroupProps {
  index: number
  startAnimation: boolean
  audioStream: MediaStream | null
}
