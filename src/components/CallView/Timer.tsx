// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useEffect, type FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { StyledTimer } from '../../styles/Island.styles'
import Moment from 'react-moment'

const Timer: FC<TimerProps> = ({ size = 'large', startTime, isHome }) => {
  // Set timer negative differences
  const [timerNegativeDifference, setTimerNegativeDifference] = useState<number>(0)
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
    <>
      {startTime != null && (
        <StyledTimer isOpen={isOpen} size={size}>
          <Moment
            date={Number(startTime) + timerNegativeDifference || new Date().getTime() / 1000}
            interval={1000}
            format='h:mm:ss'
            trim={false}
            unix
            durationFromNow
            className={`${
              isHome !== undefined && isHome
                ? 'pi-text-gray-950 dark:pi-text-gray-50'
                : 'pi-text-gray-50 dark:pi-text-gray-50'
            } pi-font-normal`}
          />
        </StyledTimer>
      )}
    </>
  )
}

export default Timer

export interface TimerProps {
  size?: 'small' | 'large'
  startTime: string
  // when the timer is used in the home view or in the pill view
  isHome?: boolean
}
