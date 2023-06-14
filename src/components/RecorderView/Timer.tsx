//
// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
//

import React, { memo, FC } from 'react'
import Moment from 'react-moment'

const Timer: FC<TimerProps> = ({ changedCallback }) => {
  return (
    <Moment
      date={Date.now() / 1000}
      interval={1000}
      format='hh:mm:ss'
      trim={false}
      onChange={changedCallback}
      unix
      durationFromNow
    />
  )
}

export default memo(Timer)

interface TimerProps {
  changedCallback: (value: string) => void
}
