// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import Alert from './Alert'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

/**
 * Shows user alerts
 */
const AlertView: FC = () => {
  const alerts = useSelector((state: RootState) => state.alerts)

  return (
    <div className='flex flex-col gap-4 mb-6'>
      {/* Show alerts */}
      {Object.values(alerts.data).map(
        (alert) =>
          alert.active && (
            <Alert type='alert' color={alert.success ? 'green' : alert.break ? 'red' : 'orange'} message={alert.message} />
          ),
      )}
    </div>
  )
}

export default AlertView