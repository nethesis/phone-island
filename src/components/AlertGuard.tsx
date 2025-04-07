// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, type ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import AlertView from './AlertView'
import { isAlertVisible } from '../utils/genericFunctions/isAlertVisible'

/**
 * Manages the logic of alerts as connection errors or permissions
 *
 * @param children
 * @returns
 */

export const AlertGuard: FC<AlertGuard> = ({ children }) => {
  // Get alert status from alerts store
  const { breakActiveAlertsCount } = useSelector((state: RootState) => state.alerts.status)
  // Get alerts status from alerts store
  const { call_transfered } = useSelector((state: RootState) => state.alerts.data)

  // Use the shared function to determine if alerts should be visible
  const shouldShowAlerts = isAlertVisible()

  return (
    <>
      {shouldShowAlerts && <AlertView />}
      {breakActiveAlertsCount === 0 && !call_transfered.active && children}
    </>
  )
}

interface AlertGuard {
  children: ReactNode
}
