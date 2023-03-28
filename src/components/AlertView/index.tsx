// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import Alert from './Alert'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { motion } from 'framer-motion/dist/cjs'

/**
 * Shows user alerts
 */
const AlertView: FC = () => {
  const alerts = useSelector((state: RootState) => state.alerts)

  return (
    <motion.div
      className='pi-flex pi-flex-col pi-gap-4 pi-mb-6 pi-overflow-y-auto'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        maxHeight: '6.5rem',
      }}
    >
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
    </motion.div>
  )
}

export default AlertView
