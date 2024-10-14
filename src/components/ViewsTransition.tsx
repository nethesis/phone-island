// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, type FC } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const ViewsTransition: FC<ViewTransitionTypes> = ({ children, forView }) => {
  const { view } = useSelector((state: RootState) => state.island)
  return (
    <motion.div
      animate={view === forView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      {children && children}
    </motion.div>
  )
}

export default ViewsTransition

interface ViewTransitionTypes {
  children: ReactNode
  forView: string
}
