// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC } from 'react'
import { CallEvents } from '../events'

interface EventsProps {
  children: ReactNode
  janus: any
  sipcall: any
}

export const Events: FC<EventsProps> = ({ children, janus, sipcall }) => {
  return (
    <>
      {janus && sipcall && <CallEvents janus={janus} sipcall={sipcall} />}
      {children}
    </>
  )
}
