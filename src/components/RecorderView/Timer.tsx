//
// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
//

import React, { memo, FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Moment from 'react-moment'
import { RootState, Dispatch } from '../../store'

const Timer: FC<TimerProps> = () => {
  const { startTime, currentTime, recording } = useSelector((state: RootState) => ({
    recording: state.recorder.recording,
    startTime: state.recorder.startTime,
    currentTime: state.recorder.currentTime,
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

export default memo(Timer)

interface TimerProps {}
