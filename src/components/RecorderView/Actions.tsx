// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState, useEffect } from 'react'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRecordVinyl, faStop, faCircleNotch } from '@nethesis/nethesis-solid-svg-icons'
import { startAnnouncementRecording } from '../../services/offhour'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { hangupCurrentCall, answerIncomingCall } from '../../lib/phone/call'

export const Actions: FC<{ animationStartedCallback: (started: boolean) => void }> = ({
  animationStartedCallback,
}) => {
  const [animationStarted, setAnimationStarted] = useState<boolean>(false)
  const dispatch = useDispatch<Dispatch>()
  const { incoming, waiting, recording } = useSelector((state: RootState) => state.recorder)

  function handleStart() {
    // Update the recorder state
    dispatch.recorder.setRecording(true)
    dispatch.recorder.setWaiting(true)

    // Call the api to start the recording call
    startAnnouncementRecording()
  }

  function handleStop() {
    // set waiting to true
    dispatch.recorder.setWaiting(true)
    // Call the function to hangup the current call used for recording
    hangupCurrentCall()
    // Manage animation status
    animationStartedCallback(false)
  }

  useEffect(() => {
    if (!recording) {
      setAnimationStarted(false)
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

      // Manage animation status
      animationStartedCallback(true)
      setAnimationStarted(true)
    }
  }, [incoming])

  return (
    <div className='pi-flex pi-justify-center pi-items-center pi-pt-9'>
      {animationStarted ? (
        <Button onClick={handleStop} variant='default' className='pi-scale-110'>
          {waiting ? (
            <FontAwesomeIcon icon={faCircleNotch} className='fa-spin pi-loader' size='lg' />
          ) : (
            <FontAwesomeIcon icon={faStop} size='xl' />
          )}
        </Button>
      ) : (
        <Button onClick={handleStart} variant='red' className='pi-scale-110'>
          {waiting ? (
            <FontAwesomeIcon icon={faCircleNotch} className='fa-spin pi-loader' size='lg' />
          ) : (
            <FontAwesomeIcon icon={faRecordVinyl} size='xl' />
          )}
        </Button>
      )}
    </div>
  )
}
