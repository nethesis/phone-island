// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import Alert from './Alert'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { motion } from 'framer-motion'

/**
 * Shows user alerts
 */
const AlertView: FC = () => {
  const { data, status } = useSelector((state: RootState) => state.alerts)

  return (
    <motion.div
      className={`pi-flex pi-flex-col pi-gap-4 pi-mb-6 pi-overflow-y-auto pi-custom-scrollbar ${
        status.activeAlertsCount > 1 && 'pi-pr-2'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        maxHeight: '5.5rem',
      }}
    >
      {/* Show alerts */}
      {Object.values(data).map(
        (alert:any, index) =>
          alert.active && (
            <Alert
              key={index}
              type='alert'
              color={alert?.success ? 'green' : alert?.break ? 'red' : 'orange'}
              message={alert?.message}
            />
          ),
      )}
    </motion.div>
  )
}

export default AlertView
