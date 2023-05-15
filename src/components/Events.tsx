// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC } from 'react'
import { CallEvents, PlayerEvents, RecorderEvents } from '../events'

interface EventsProps {
  children: ReactNode
  sipHost: string
}

export const Events: FC<EventsProps> = ({ sipHost, children }) => {
  return (
    <>
      {<PlayerEvents />}
      {<RecorderEvents />}
      {<CallEvents sipHost={sipHost} />}
      {children}
    </>
  )
}
