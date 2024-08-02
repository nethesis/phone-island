//
// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
//

import React, { memo, FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Moment from 'react-moment'
import { RootState, Dispatch } from '../../store'

const PhysicalTimer: FC<TimerProps> = () => {
  const { startTime, currentTime, recording } = useSelector((state: RootState) => ({
    recording: state.physicalRecorder.recording,
    startTime: state.physicalRecorder.startTime,
    currentTime: state.physicalRecorder.currentTime,
  }))

  const dispatch = useDispatch<Dispatch>()

  function handleTimerChanged(time: string) {
    dispatch.recorder.setCurrentTime(time)
  }

  return (
    <>
      {startTime && recording ? (
        <Moment
          date={startTime}
          interval={1000}
          format='hh:mm:ss'
          trim={false}
          onChange={handleTimerChanged}
          unix
          durationFromNow
        />
      ) : (
        currentTime
      )}
    </>
  )
}

export default memo(PhysicalTimer)

interface TimerProps {}
