// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState, useRef, useEffect, useCallback, memo } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { Actions } from './Actions'
import { BarsGroup } from './BarsGroup'
import Progress from '../AudioPlayerView/Progress'
import { updateAudioPlayerSource } from '../../lib/phone/audio'
import fixWebmDuration from 'webm-duration-fix'
import Timer from './Timer'
import { useTranslation } from 'react-i18next'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faXmark, faPlay } from '@fortawesome/free-solid-svg-icons'
import { eventDispatch } from '../../utils'

// The number of groups to be created
// ...the minimun to have this effect is 2
const BAR_GROUPS_COUNT = 2

// The mime type of the recorded audio
const MIME_TYPE = 'audio/webm'

export const RecorderView: FC<RecorderViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { audioPlayerPlaying } = useSelector((state: RootState) => state.player)
  const visibleContainerRef = useRef<HTMLDivElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const mediaChunks = useRef<BlobPart[]>([])

  // Initialize state dispatch
  const dispatch = useDispatch<Dispatch>()

  // Retrieve the local audio stream from webrtc state
  const localAudioStream = useSelector((state: RootState) => state.webrtc.localAudioStream)

  // Retrieve the local audio stream from recorder state
  const { recording, recorded, waiting } = useSelector(
    (state: RootState) => ({
      recording: state.recorder.recording,
      recorded: state.recorder.recorded,
      waiting: state.recorder.waiting,
    }),
    shallowEqual,
  )

  function handleRecordedMedia(event: BlobEvent) {
    mediaChunks.current.push(event.data)
  }

  async function handleRecordingStopped() {
    const blob = await fixWebmDuration(new Blob(mediaChunks.current, { type: MIME_TYPE }))
    const audioURL = URL.createObjectURL(blob)
    // The next function is async
    updateAudioPlayerSource(audioURL)
  }

  // Handle and manage audio recording start
  useEffect(() => {
    // @ts-ignore
    if (localAudioStream?.active && recording) {
      recorderRef.current = new MediaRecorder(localAudioStream, {
        mimeType: MIME_TYPE,
      })
      recorderRef.current.ondataavailable = handleRecordedMedia
      recorderRef.current.onstop = handleRecordingStopped
      // Start the media recording
      recorderRef.current.start()
    }
    // @ts-ignore
  }, [localAudioStream?.active, recording])

  // Handle and manage audio recorded
  useEffect(() => {
    if (recorded) {
      mediaChunks.current = []
      recorderRef.current?.stop()
    }
  }, [recorded])

  // Handle view close and reset state
  useEffect(() => {
    // Set visible container reference to recorder state
    dispatch.recorder.setVisibleContainerRef(visibleContainerRef)

    return () => {
      dispatch.recorder.reset()
    }
  }, [])

  const { t } = useTranslation()

  function playerClose() {
    if (audioPlayerPlaying) {
      dispatch.player.stopAudioPlayer()
      eventDispatch('phone-island-audio-player-close', {})
    }
    dispatch.island.resetPlayerClose()
  }

  function close() {
    dispatch.island.resetPlayerClose()
  }

  return (
    <>
      {isOpen ? (
        <>
          {' '}
          <div className='pi-flex pi-items-center pi-justify-between pi-text-gray-900 dark:pi-text-gray-50'>
            <h1 className='pi-text-lg pi-font-medium pi-leading-7'>{t('Common.Record message')}</h1>
            <Button
              onClick={() => close()}
              variant='transparentSettings'
              data-tooltip-id='tooltip-close-settings'
              data-tooltip-content={t('Common.Close') || ''}
            >
              <FontAwesomeIcon icon={faXmark} className='pi-w-5 pi-h-5' />
            </Button>
          </div>
          <div className='pi-pt-4'>
            <div
              className={`${
                !recording || waiting || audioPlayerPlaying ? 'pi-mb-3' : ''
              } pi-flex pi-w-full pi-justify-center pi-items-center`}
            >
              <div className='pi-font-medium pi-text-4xl pi-w-fit pi-h-fit dark:pi-text-white'>
                <Timer />
              </div>
            </div>
            {/* Bars animation section  */}
            <div
              className={`pi-relative pi-w-full pi-justify-center pi-overflow-hidden pi-flex pi-items-center`}
              ref={visibleContainerRef}
            >
              {recorded ? (
                <Progress />
              ) : recording && !waiting ? (
                <div className='pi-flex pi-items-center pi-justify-between pi-w-full pi-pb-3 pi-overflow-hidden'>
                  {/* Play button (disabled) on left */}
                  <Button variant='transparent' disabled className='pi-flex pi-flex-none'>
                    <FontAwesomeIcon
                      icon={faPlay}
                      className='pi-h-4 pi-w-4 pi-text-gray-700 dark:pi-text-gray-200'
                    />
                  </Button>

                  {/* Audio visualization in the middle */}
                  <div className='pi-relative pi-overflow-hidden pi-flex pi-flex-grow pi-justify-center pi-h-4'>
                    {/* Create a custom numbers of bars groups */}
                    {Array.from({ length: BAR_GROUPS_COUNT }).map((_, i) => (
                      <BarsGroup
                        key={i}
                        index={i}
                        startAnimation={recording}
                        audioStream={localAudioStream}
                      />
                    ))}
                  </div>

                  {/* Trash button (disabled) on right */}
                  <Button variant='transparent' disabled className='pi-flex pi-flex-none'>
                    <FontAwesomeIcon
                      icon={faTrash}
                      className='pi-h-4 pi-w-4 pi-text-gray-700 dark:pi-text-gray-200'
                    />
                  </Button>
                </div>
              ) : recording && waiting ? (
                <div className='pi-sans pi-text-sm pi-w-fit pi-h-fit dark:pi-text-white pi-pb-7'>
                  {t('Common.Start recording message after')}
                </div>
              ) : (
                <div className='pi-sans pi-text-sm pi-w-fit pi-h-fit dark:pi-text-white pi-pb-7'>
                  {t('Common.Start recording message before')}
                </div>
              )}
            </div>
          </div>
          {/* Actions section */}
          <Actions />
        </>
      ) : (
        <div className='pi-font-medium pi-text-base'>Recorder</div>
      )}
    </>
  )
}

export interface RecorderViewProps {}
