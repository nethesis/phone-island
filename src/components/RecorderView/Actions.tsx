//
// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
//

import React, { type FC, useEffect } from 'react'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPause,
  faPlay,
  faTrash,
  faCheck,
  faRecordVinyl,
  faStop,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons'
import { startAnnouncementRecording } from '../../services/offhour'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { hangupCurrentCall, answerIncomingCall } from '../../lib/phone/call'
import { dispatchRecordingSave } from '../../events'
import { Tooltip } from 'react-tooltip/dist/react-tooltip.min.cjs'
import { useTranslation } from 'react-i18next'
import { useEventListener, eventDispatch } from '../../utils'
import DropdownContent from '../SwitchInputView/DropdownContent'

export const Actions: FC<{}> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { incoming, waiting, recording, recorded, playing } = useSelector(
    (state: RootState) => ({
      incoming: state.recorder.incoming,
      waiting: state.recorder.waiting,
      recording: state.recorder.recording,
      recorded: state.recorder.recorded,
      playing: state.recorder.playing,
    }),
    shallowEqual,
  )

  async function handleStart() {
    // Update the recorder state
    dispatch.recorder.setRecording(true)
    dispatch.recorder.setWaiting(true)
    // Call the api to start the recording call
    const data: { tempFilename: string } | null = await startAnnouncementRecording()
    // Set the returned temp file name to the store
    if (data.tempFilename) dispatch.recorder.setTempFilename(data.tempFilename)
    // Set the start time of recording
    dispatch.recorder.setStartTime(`${Date.now() / 1000}`)
    eventDispatch('phone-island-recording-started', {})
  }
  useEventListener('phone-island-recording-start', (data: {}) => {
    handleStart()
  })

  function handleStop() {
    // Set waiting to true
    dispatch.recorder.setWaiting(true)
    // Call the function to hangup the current call used for recording
    hangupCurrentCall()
    dispatch.recorder.setRecorded(true)
    eventDispatch('phone-island-recording-stopped', {})
  }
  useEventListener('phone-island-recording-stop', (data: {}) => {
    handleStop()
  })

  function handlePlay() {
    dispatch.player.startAudioPlayer(() => {
      // The callback for the end event of the audio player
      dispatch.recorder.setPlaying(false)
      dispatch.recorder.setPaused(true)
    })
    dispatch.recorder.setPlaying(true)
    eventDispatch('phone-island-recording-played', {})
  }
  useEventListener('phone-island-recording-play', (data: {}) => {
    handlePlay()
  })

  function handlePause() {
    dispatch.player.pauseAudioPlayer()
    dispatch.recorder.setPlaying(false)
    dispatch.recorder.setPaused(true)
    eventDispatch('phone-island-recording-paused', {})
  }
  useEventListener('phone-island-recording-pause', (data: {}) => {
    handlePause()
  })

  function handleDelete() {
    dispatch.recorder.resetRecorded()
    eventDispatch('phone-island-recording-deleted', {})
  }
  useEventListener('phone-island-recording-delete', (data: {}) => {
    handleDelete()
  })

  function handleSaveRecording() {
    // Dispatch the reconrding save event
    dispatchRecordingSave()
    // Close the Island
    dispatch.island.setIslandView(null)
  }
  useEventListener('phone-island-recording-save', (data: {}) => {
    handleSaveRecording()
  })

  useEffect(() => {
    if (!recording) {
      dispatch.recorder.setWaiting(false)
    }
  }, [recording])

  useEffect(() => {
    if (incoming) {
      // Answer the incoming call for recording
      answerIncomingCall()
      // Reset incoming to recorder state
      dispatch.recorder.setIncoming(false)
      dispatch.recorder.setWaiting(false)
    }
  }, [incoming])

  const { t } = useTranslation()

  return (
    <div
      className={`pi-flex pi-justify-center pi-items-center pi-pt-9 pi-gap-6`}
      style={recorded ? { paddingTop: '2rem' } : {}}
    >
      {recording && (
        <Button
          onClick={handleStop}
          variant='default'
          style={{ transform: 'scale(1.15)' }}
          data-tooltip-id='tooltip'
          data-tooltip-content={t('Tooltip.Stop')}
        >
          {waiting ? (
            <FontAwesomeIcon icon={faCircleNotch} className='fa-spin pi-loader' size='lg' />
          ) : (
            <FontAwesomeIcon icon={faStop} size='xl' />
          )}
        </Button>
      )}
      {recorded && !recording && (
        <>
          <Button
            onClick={handleDelete}
            variant='default'
            data-tooltip-id='tooltip'
            data-tooltip-content={t('Tooltip.Delete')}
          >
            <FontAwesomeIcon icon={faTrash} size='xl' />
          </Button>
          {playing ? (
            <Button
              onClick={handlePause}
              variant='default'
              style={{ transform: 'scale(1.15)' }}
              data-tooltip-id='tooltip'
              data-tooltip-content={t('Tooltip.Pause')}
            >
              <FontAwesomeIcon icon={faPause} size='xl' />
            </Button>
          ) : (
            <Button
              onClick={handlePlay}
              variant='default'
              style={{ transform: 'scale(1.15)' }}
              data-tooltip-id='tooltip'
              data-tooltip-content={t('Tooltip.Play')}
            >
              <FontAwesomeIcon icon={faPlay} size='xl' />
            </Button>
          )}
          <Button
            onClick={handleSaveRecording}
            variant='green'
            data-tooltip-id='tooltip'
            data-tooltip-content={t('Tooltip.Confirm')}
          >
            <FontAwesomeIcon icon={faCheck} size='xl' />
          </Button>
        </>
      )}
      {!recording && !recorded && (
        <Button
          onClick={handleStart}
          variant='red'
          style={{ transform: 'scale(1.15)' }}
          data-tooltip-id='tooltip'
          data-tooltip-content={t('Tooltip.Start recording')}
        >
          {waiting ? (
            <FontAwesomeIcon icon={faCircleNotch} className='fa-spin pi-loader' size='lg' />
          ) : (
            <FontAwesomeIcon icon={faRecordVinyl} size='xl' />
          )}
        </Button>
      )}
      {!recording && !recorded && (
        <div
          className='pi-grid pi-grid-cols-1 pi-ml-8'
        >
          <DropdownContent data-stop-propagation={true}></DropdownContent>
        </div>
      )}
      {/* Buttons tooltips */}
      <Tooltip className='pi-z-20' id='tooltip' place='bottom' />
    </div>
  )
}
