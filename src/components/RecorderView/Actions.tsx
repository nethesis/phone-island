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
  }

  function handleStop() {
    // Set waiting to true
    dispatch.recorder.setWaiting(true)
    // Call the function to hangup the current call used for recording
    hangupCurrentCall()
    dispatch.recorder.setRecorded(true)
  }

  function handlePlay() {
    dispatch.player.startAudioPlayer(() => {
      // The callback for the end event of the audio player
      dispatch.recorder.setPlaying(false)
      dispatch.recorder.setPaused(true)
    })
    dispatch.recorder.setPlaying(true)
  }

  function handlePause() {
    dispatch.player.pauseAudioPlayer()
    dispatch.recorder.setPlaying(false)
    dispatch.recorder.setPaused(true)
  }

  function handleDelete() {
    dispatch.recorder.resetRecorded()
  }

  function handleSaveRecording() {
    // Dispatch the reconrding save event
    dispatchRecordingSave()
    // Close the Island
    dispatch.island.setIslandView(null)
  }

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
          data-tooltip-content='Stop'
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
            data-tooltip-content='Delete'
          >
            <FontAwesomeIcon icon={faTrash} size='xl' />
          </Button>
          {playing ? (
            <Button
              onClick={handlePause}
              variant='default'
              style={{ transform: 'scale(1.15)' }}
              data-tooltip-id='tooltip'
              data-tooltip-content='Pause'
            >
              <FontAwesomeIcon icon={faPause} size='xl' />
            </Button>
          ) : (
            <Button
              onClick={handlePlay}
              variant='default'
              style={{ transform: 'scale(1.15)' }}
              data-tooltip-id='tooltip'
              data-tooltip-content='Play'
            >
              <FontAwesomeIcon icon={faPlay} size='xl' />
            </Button>
          )}
          <Button
            onClick={handleSaveRecording}
            variant='green'
            data-tooltip-id='tooltip'
            data-tooltip-content='Confirm'
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
          data-tooltip-content='Start recording'
        >
          {waiting ? (
            <FontAwesomeIcon icon={faCircleNotch} className='fa-spin pi-loader' size='lg' />
          ) : (
            <FontAwesomeIcon icon={faRecordVinyl} size='xl' />
          )}
        </Button>
      )}
      {/* Buttons tooltips */}
      <Tooltip className='pi-z-20' id='tooltip' place='bottom' />
    </div>
  )
}
