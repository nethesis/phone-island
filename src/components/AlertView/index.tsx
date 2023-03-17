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
    <div className='pi-flex pi-flex-col pi-gap-4 pi-mb-6 pi-overflow-y-auto' style={{
      maxHeight: '6.5rem'
    }}>
      {/* Show alerts */}
      {Object.values(alerts.data).map(
        (alert, index) =>
          alert.active && (
            <Alert
              key={index}
              type='alert'
              color={alert.success ? 'green' : alert.break ? 'red' : 'orange'}
              message={alert.message}
            />
          ),
      )}
    </div>
  )
}

export default AlertView
