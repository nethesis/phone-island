// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../store'
import { Actions } from './Actions'
import { BarsGroup } from './BarsGroup'
import { useIsomorphicLayoutEffect } from '../../utils'
import Moment from 'react-moment'

// The number of groups to be created
// ...the minimun to have this effect is 2
const BAR_GROUPS_COUNT = 2

export const RecorderView: FC<RecorderViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const visibleContainerRef = useRef<HTMLDivElement>(null)
  const [animationStarted, setAnimationStarted] = useState<boolean>(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const mediaChunks = useRef<Blob[]>([])

  // Initialize state dispatch
  const dispatch = useDispatch<Dispatch>()

  // Retrieve the local audio stream from webrtc state
  const { localAudioStream } = useSelector((state: RootState) => state.webrtc)
  // Retrieve the local audio stream from recorder state
  const { recording } = useSelector((state: RootState) => state.recorder)

  // Set visible container reference to recorder state
  useIsomorphicLayoutEffect(() => {
    dispatch.recorder.setVisibleContainerRef(visibleContainerRef)
  }, [])

  function handleRecordedMedia(event: BlobEvent) {
    mediaChunks.current.push(event.data)
  }

  function handleRecordingStopped(e) {
    const blob = new Blob(mediaChunks.current, { type: 'audio/webm' })
    const audioURL = URL.createObjectURL(blob)
    dispatch.player.updateAudioPlayerSource(audioURL)
  }

  // Manage audio recording start
  useEffect(() => {
    // @ts-ignore
    if (localAudioStream && localAudioStream.active && animationStarted) {
      recorderRef.current = new MediaRecorder(localAudioStream, { mimeType: 'audio/webm' })
      recorderRef.current.ondataavailable = handleRecordedMedia
      recorderRef.current.onstop = handleRecordingStopped
      // Start the media recording
      recorderRef.current.start()
    }
    // @ts-ignore
  }, [localAudioStream, localAudioStream?.active, animationStarted])

  useEffect(() => {
    if (recording && !animationStarted) {
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
              {animationStarted ? (
                <Moment
                  date={new Date().getTime() / 1000}
                  interval={1000}
                  format='hh:mm:ss'
                  trim={false}
                  unix
                  durationFromNow
                />
              ) : (
                '00:00:00'
              )}
            </div>
          </div>
          {/* Bars animation section  */}
          <div
            className='pi-relative pi-w-full pi-h-8 pi-overflow-x-hidden pi-flex'
            ref={visibleContainerRef}
          >
            {/* Create a custom numbers of bars groups */}
            {Array.from({ length: BAR_GROUPS_COUNT }).map((_, i) => (
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
