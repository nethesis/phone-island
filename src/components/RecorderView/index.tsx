// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../store'
import { Actions } from './Actions'
import { BarsGroup } from './BarsGroup'
import { useIsomorphicLayoutEffect } from '../../utils'

export const RecorderView: FC<RecorderViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const visibleContainerRef = useRef<HTMLDivElement>(null)
  const [animationStarted, setAnimationStarted] = useState<boolean>(false)
  const recorderRef = useRef<any>(null)
  const mediaChunks = useRef<Blob[]>([])

  // Initialize state dispatch
  const dispatch = useDispatch<Dispatch>()

  // Retrieve the local audio stream from webrtc state
  const { localAudioStream } = useSelector((state: RootState) => state.webrtc)

  // Set visible container reference to recorder state
  useIsomorphicLayoutEffect(() => {
    dispatch.recorder.setVisibleContainerRef(visibleContainerRef)
  }, [])

  function handleRecordedMedia(event: BlobEvent) {
    mediaChunks.current.push(event.data)
  }

  function handleRecordingStopped(e) {
    const blob = new Blob(mediaChunks.current, { type: 'audio/ogg; codecs=opus' })
    const audioURL = URL.createObjectURL(blob)
    // TODO - ADD THE AUDIOURL TO THE AUDIO ELEMENT AND USE IT TO PLAY 
  }

  // Starts the recording of the local audio stream
  function startRecording() {
    if (recorderRef.current) {
      recorderRef.current = localAudioStream && new MediaRecorder(localAudioStream)
      recorderRef.current.ondataavailable = handleRecordedMedia
      recorderRef.current.onstop = handleRecordingStopped
      // Start the media recording
      recorderRef.current.start()
    }
  }

  useEffect(() => {
    if (animationStarted) {
      startRecording()
    } else {
      recorderRef.current?.stop()
    }
  }, [animationStarted])

  return (
    <>
      {isOpen ? (
        <>
          {' '}
          <div className='pi-flex pi-w-full pi-justify-center pi-items-center pi-pt-4 pi-pb-9'>
            <div className='pi-font-medium pi-text-4xl pi-w-fit pi-h-fit pi-text-white'>
              00:00:00
            </div>
          </div>
          {/* Bars animation section  */}
          <div
            className='pi-relative pi-w-full pi-h-8 pi-overflow-x-hidden pi-flex'
            ref={visibleContainerRef}
          >
            {/* Create a custom numbers of bars groups */}
            {Array.from({ length: 2 }).map((_, i) => (
              <BarsGroup
                key={i}
                index={i}
                startAnimation={animationStarted}
                audioStream={localAudioStream}
              />
            ))}
          </div>
          {/* Actions section */}
          <Actions animationStartedCallback={(started: boolean) => setAnimationStarted(started)} />
        </>
      ) : (
        <div className='pi-font-medium pi-text-base'>Recorder</div>
      )}
    </>
  )
}

export interface RecorderViewProps {}
