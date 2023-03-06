// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useEffect, type FC, type ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import AlertView from './AlertView'

/**
 * Manages the logic of alerts as connection errors or permissions
 *
 * @param children
 * @returns
 */

export const AlertGuard: FC<AlertGuard> = ({ children }) => {
  // Get alert status from alerts store
  const { activeAlertsCount, breakActiveAlertsCount } = useSelector(
    (state: RootState) => state.alerts.status,
  )
  // Get isOpen form island store
  const { isOpen } = useSelector((state: RootState) => state.island)
  // Get currentCall statuses from currentCall store
  const { incoming, accepted } = useSelector((state: RootState) => state.currentCall)

  return (
    <>
      {activeAlertsCount > 0 && <AlertView />}
      {breakActiveAlertsCount === 0 && children}
    </>
  )
}

interface AlertGuard {
  children: ReactNode
}
