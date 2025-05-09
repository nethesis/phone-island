//
// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
//

import React, { type FC, useEffect } from 'react'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faStop,
  faCircleNotch,
  faGear,
  faDownLeftAndUpRightToCenter,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons'
import { startAnnouncementRecording } from '../../services/offhour'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { hangupCurrentCall, answerIncomingCall } from '../../lib/phone/call'
import { dispatchRecordingSave } from '../../events'
import { useTranslation } from 'react-i18next'
import { useEventListener, eventDispatch } from '../../utils'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { faRecord } from '@nethesis/nethesis-solid-svg-icons'

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

  function handleSaveRecording() {
    // check if the audio is playing and pause it
    if (playing) {
      dispatch.player.pauseAudioPlayer()
      dispatch.recorder.setPlaying(false)
      dispatch.recorder.setPaused(true)
    }
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
      className={`pi-flex pi-items-center pi-justify-between pi-px-6 pi-py-2 pi-gap-0 pi-w-full pi-mt-auto`}
    >
      <Button
        variant='transparent'
        disabled
        className='pi-w-6 pi-h-6 pi-flex pi-items-center pi-justify-center pi-flex-none'
      >
        <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} className='pi-w-6 pi-h-6' />
      </Button>

      <div className='pi-flex pi-items-center pi-justify-center pi-flex-grow'>
        {recording && (
          <Button
            onClick={handleStop}
            variant='default'
            className='pi-rounded-full pi-w-14 pi-h-14 pi-flex pi-items-center pi-justify-center'
            data-tooltip-id='tooltip-stop-recorder-view'
            data-tooltip-content={t('Tooltip.Stop') || ''}
          >
            {waiting ? (
              <FontAwesomeIcon icon={faCircleNotch} className='fa-spin pi-loader' size='lg' />
            ) : (
              <FontAwesomeIcon icon={faStop} size='xl' />
            )}
          </Button>
        )}
        {recorded && !recording && (
          <Button
            onClick={handleSaveRecording}
            variant='default'
            className='pi-rounded-full pi-w-14 pi-h-14 pi-flex pi-items-center pi-justify-center'
            data-tooltip-id='tooltip-confirm-record-view'
            data-tooltip-content={t('Tooltip.Confirm') || ''}
          >
            <FontAwesomeIcon icon={faFloppyDisk} className='pi-h-6 pi-w-6' />
          </Button>
        )}
        {!recording && !recorded && (
          <Button
            onClick={handleStart}
            variant='default'
            className='pi-rounded-full pi-w-14 pi-h-14 pi-flex pi-items-center pi-justify-center'
            data-tooltip-id='tooltip-start-recording-recorder-view'
            data-tooltip-content={t('Tooltip.Start recording') || ''}
          >
            {waiting ? (
              <FontAwesomeIcon icon={faCircleNotch} className='fa-spin pi-loader' size='lg' />
            ) : (
              <FontAwesomeIcon icon={faRecord} className='pi-h-6 pi-w-6' />
            )}
          </Button>
        )}
      </div>

      <div
        onClick={() => dispatch.island.setIslandView('settings')}
        data-tooltip-id='tooltip-settings-view-recorder'
        data-tooltip-content={t('Tooltip.Go to settings') || ''}
        className='pi-flex pi-items-center pi-justify-center pi-cursor-pointer pi-text-gray-700 dark:pi-text-gray-200 pi-w-6 pi-h-6 pi-flex-none'
      >
        <FontAwesomeIcon icon={faGear} className={`pi-h-6 pi-w-6`} />
      </div>

      {/* Buttons tooltips */}
      <CustomThemedTooltip id='tooltip-start-recording-recorder-view' place='top' />
      <CustomThemedTooltip id='tooltip-stop-recorder-view' place='top' />
      <CustomThemedTooltip id='tooltip-confirm-record-view' place='top' />
      <CustomThemedTooltip id='tooltip-settings-view-recorder' place='top' />
    </div>
  )
}
