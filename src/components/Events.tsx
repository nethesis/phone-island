// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC } from 'react'
import { CallEvents } from '../events'

interface EventsProps {
  children: ReactNode
}

export const Events: FC<EventsProps> = ({ children }) => {
  return (
    <>
      {<CallEvents />}
      {children}
    </>
  )
}
