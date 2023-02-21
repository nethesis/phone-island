// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useEffect, type FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { StyledTimer } from '../../styles/Island.styles'
import Moment from 'react-moment'

const Timer: FC = () => {
  // Set timer negative differences
  const [timerNegativeDifference, setTimerNegativeDifference] = useState<number>(0)
  // Get multiple values from the currentCall store
  const { startTime } = useSelector((state: RootState) => state.currentCall)
  // Get isOpen from the island store
  const { isOpen } = useSelector((state: RootState) => state.island)

  useEffect(() => {
    if (startTime) {
      const difference = new Date().getTime() / 1000 - Number(startTime)
      if (difference < 0) {
        setTimerNegativeDifference(difference)
      }
    }
  }, [startTime])

  return (
    <StyledTimer isOpen={isOpen}>
      {startTime && timerNegativeDifference && (
        <Moment
          date={Number(startTime) + timerNegativeDifference || new Date().getTime() / 1000}
          interval={1000}
          format='h:mm:ss'
          trim={false}
          unix
          durationFromNow
        />
      )}
    </StyledTimer>
  )
}

export default Timer
