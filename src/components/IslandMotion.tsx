// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC } from 'react'
import { RootState } from '../store'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion/dist/framer-motion'

export const IslandMotion: FC<IslandMotionProps> = ({ children }) => {
  // Retrieve needed stored variables
  const { incoming, outgoing, accepted, transferring } = useSelector(
    (state: RootState) => state.currentCall,
  )
  const { view, isOpen } = useSelector((state: RootState) => state.island)
  const { activeAlertsCount } = useSelector((state: RootState) => state.alerts.status)
  const {
    variants,
    border_radius_collapsed,
    border_radius_expanded,
    padding_x_collapsed,
    padding_y_collapsed,
    padding_expanded,
  } = useSelector((state: RootState) => state.motions)

  function getVariant() {
    // Initial size
    let size: SizeTypes = {
      width: 0,
      height: 0,
    }
    switch (view) {
      case 'call':
        if (isOpen) {
          if (accepted && transferring) {
            size = {
              width: variants.call.expanded.transfer.width,
              height: variants.call.expanded.transfer.height,
            }
          } else if (accepted) {
            size = {
              width: variants.call.expanded.accepted.width,
              height: variants.call.expanded.accepted.height,
            }
          } else if (incoming) {
            size = {
              width: variants.call.expanded.incoming.width,
              height: variants.call.expanded.incoming.height,
            }
          } else if (outgoing) {
            size = {
              width: variants.call.expanded.outgoing.width,
              height: variants.call.expanded.outgoing.height,
            }
          }
        } else {
          size = {
            width: variants.call.collapsed.width,
            height: variants.call.collapsed.height,
          }
        }
        break
      case 'keypad':
        if (isOpen) {
          size = {
            width: variants.keypad.expanded.width,
            height: variants.keypad.expanded.height,
          }
        } else {
          size = {
            width: variants.transfer.collapsed.width,
            height: variants.transfer.collapsed.height,
          }
        }
        break
      case 'transfer':
        if (isOpen) {
          size = {
            width: variants.transfer.expanded.width,
            height: variants.transfer.expanded.height,
          }
        } else {
          size = {
            width: variants.transfer.collapsed.width,
            height: variants.transfer.collapsed.height,
          }
        }
        break
      case 'player':
        if (isOpen) {
          size = {
            width: variants.player.expanded.width,
            height: variants.player.expanded.height,
          }
        } else {
          size = {
            width: variants.player.collapsed.width,
            height: variants.player.collapsed.height,
          }
        }
        break
    }

    const isAlert: boolean = activeAlertsCount > 0

    return {
      width: `${size.width === 0 && isAlert ? variants.alerts.width : size.width}px`,
      height: `${
        isAlert && isOpen
          ? size.height +
            variants.alerts.height +
            (size.height === 0 ? padding_expanded * 2 : padding_expanded)
          : size.height
      }px`,
      borderRadius: isOpen ? `${border_radius_expanded}px` : `${border_radius_collapsed}px`,
      padding: isOpen
        ? `${padding_expanded}px`
        : `${padding_x_collapsed}px ${padding_y_collapsed}px`,
    }
  }

  const motionVariants = getVariant()

  return (
    <motion.div
      className='pi-font-sans pi-pointer-events-auto pi-overflow-hidden pi-bg-black pi-text-xs pi-cursor-pointer pi-text-white hover:pi-shadow-2xl pi-rounded-3xl pi-transition-shadow'
      animate={motionVariants}
    >
      {children && children}
    </motion.div>
  )
}

export interface IslandMotionProps {
  children: ReactNode
}

type SizeTypes = {
  width: number
  height: number
}

export default IslandMotion
