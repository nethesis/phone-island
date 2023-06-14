// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState, useRef, useEffect, useCallback, memo } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { Actions } from './Actions'
import { BarsGroup } from './BarsGroup'
import { useIsomorphicLayoutEffect } from '../../utils'
import Progress from '../AudioPlayerView/Progress'
import { updateAudioPlayerSource } from '../../lib/phone/audio'
import fixWebmDuration from 'webm-duration-fix'
import TimerComponent from './Timer'

// The number of groups to be created
// ...the minimun to have this effect is 2
const BAR_GROUPS_COUNT = 2

// The mime type of the recorded audio
const MIME_TYPE = 'video/webm;codecs=vp9'

export const RecorderView: FC<RecorderViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const visibleContainerRef = useRef<HTMLDivElement>(null)
  const [animationStarted, setAnimationStarted] = useState<boolean>(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const mediaChunks = useRef<BlobPart[]>([])

  // Initialize state dispatch
  const dispatch = useDispatch<Dispatch>()

  // Retrieve the local audio stream from webrtc state
  const localAudioStream = useSelector((state: RootState) => state.webrtc.localAudioStream)

  // Retrieve the local audio stream from recorder state
  const { recording, recorded, currentTime } = useSelector(
    (state: RootState) => ({
      recording: state.recorder.recording,
      recorded: state.recorder.recorded,
      currentTime: state.recorder.currentTime,
    }),
    shallowEqual,
  )

  function handleRecordedMedia(event: BlobEvent) {
    mediaChunks.current.push(event.data)
  }

  // Time changed callback
  function timerChanged(value: string) {
    dispatch.recorder.setCurrentTime(value)
  }

  async function handleRecordingStopped(e) {
    const blob = await fixWebmDuration(new Blob(mediaChunks.current, { type: MIME_TYPE }))
    const audioURL = URL.createObjectURL(blob)
    // The next function is async
    updateAudioPlayerSource(audioURL)
  }

  // Set visible container reference to recorder state
  useIsomorphicLayoutEffect(() => {
    dispatch.recorder.setVisibleContainerRef(visibleContainerRef)
  }, [])

  // Handle and manage audio recording start
  useEffect(() => {
    // @ts-ignore
    if (localAudioStream && localAudioStream.active && animationStarted) {
      recorderRef.current = new MediaRecorder(localAudioStream, {
        mimeType: MIME_TYPE,
      })
      recorderRef.current.ondataavailable = handleRecordedMedia
      recorderRef.current.onstop = handleRecordingStopped
      // Start the media recording
      recorderRef.current.start()
    }
    // @ts-ignore
  }, [localAudioStream, localAudioStream?.active, animationStarted])

  // Handle and manage recording stop
  useEffect(() => {
    if (recording && !animationStarted) {
      recorderRef.current?.stop()
    }
  }, [animationStarted])

  // Handle view close and reset state
  useEffect(() => {
    return () => {
      dispatch.recorder.reset()
    }
  }, [])

  // Handle and manage audio recorded
  useEffect(() => {
    if (recorded) mediaChunks.current = []
  }, [recorded])

  // Avoid timer multiple renderings
  const Timer = useCallback(() => <TimerComponent changedCallback={timerChanged} />, [])

  return (
    <>
      {isOpen ? (
        <>
          {' '}
          <div className='pi-flex pi-w-full pi-justify-center pi-items-center pi-pt-4 pi-pb-9'>
            <div className='pi-font-medium pi-text-4xl pi-w-fit pi-h-fit pi-text-white'>
              {animationStarted ? <Timer /> : currentTime}
            </div>
          </div>
          {/* Bars animation section  */}
          <div
            className={`pi-relative pi-w-full ${
              !recorded ? 'pi-h-8' : ''
            } pi-overflow-x-hidden pi-flex`}
            ref={visibleContainerRef}
          >
            {recorded ? (
              <Progress />
            ) : (
              // Create a custom numbers of bars groups
              Array.from({ length: BAR_GROUPS_COUNT }).map((_, i) => (
                <BarsGroup
                  key={i}
                  index={i}
                  startAnimation={animationStarted}
                  audioStream={localAudioStream}
                />
              ))
            )}
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
