// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, type ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import AlertView from './AlertView'

/**
 * Manages the logic of alerts as connection errors or permissions
 *
 * @param children
 * @returns
 */

export const ErrorGuard: FC<ErrorGuard> = ({ children }) => {
  const { activeAlertsCount, breakActiveAlertsCount } = useSelector(
    (state: RootState) => state.alerts.status,
  )

  return (
    <>
      {activeAlertsCount > 0 && <AlertView />}
      {breakActiveAlertsCount === 0 && children}
    </>
  )
}

interface ErrorGuard {
  children: ReactNode
}
