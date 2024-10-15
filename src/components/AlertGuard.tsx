// Copyright (C) 2024 Nethesis S.r.l.
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
  // Get alerts status from alerts store
  const { call_transfered } = useSelector((state: RootState) => state.alerts.data)
  const { isOpen } = useSelector((state: RootState) => state.island)

  return (
    <>
      {activeAlertsCount > 0 && isOpen && <AlertView />}
      {breakActiveAlertsCount === 0 && !call_transfered.active && children}
    </>
  )
}

interface AlertGuard {
  children: ReactNode
}
