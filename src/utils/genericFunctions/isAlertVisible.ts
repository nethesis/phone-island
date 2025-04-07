// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'

/**
 * Checks if alerts should be shown based on active status and user preferences
 */
export function isAlertVisible() {
  const { activeAlertsCount } = store.getState().alerts.status
  const alertsData = store.getState().alerts.data
  const { isOpen } = store.getState().island

  // Try to get user preferences from localStorage
  let alertsToAvoid: Record<string, boolean> = {}
  try {
    const savedAlerts = localStorage.getItem('phoneIslandAlertsToAvoid')
    if (savedAlerts) {
      alertsToAvoid = JSON.parse(savedAlerts)
    }
  } catch (error) {
    console.warn('Error reading alertsToAvoid from localStorage:', error)
  }

  // Check if there are active alerts that should be shown
  return (
    activeAlertsCount > 0 &&
    isOpen &&
    Object.values(alertsData).some((alert: any) => alert.active && !alertsToAvoid[alert.type])
  )
}
