// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useMemo, useEffect } from 'react'
import { RootState } from '../store'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { eventDispatch } from '../utils'

export const IslandMotion: FC<IslandMotionProps> = ({ children }) => {
  // Retrieve needed stored variables
  const {
    incoming,
    outgoing,
    accepted,
    transferring,
    incomingWebRTC,
    incomingSocket,
    conferencing,
  } = useSelector((state: RootState) => state.currentCall)
  const { isListen } = useSelector((state: RootState) => state.listen)
  const { view, isOpen, actionsExpanded, sideViewIsVisible,transcriptionViewIsVisible, isFromStreaming, isExtraLarge } = useSelector(
    (state: RootState) => state.island,
  )
  const { activeAlertsCount } = useSelector((state: RootState) => state.alerts.status)
  const {
    variants,
    border_radius_collapsed,
    border_radius_expanded,
    border_radius_collapsed_conference,
    padding_x_collapsed,
    padding_y_collapsed,
    padding_expanded,
    alert_padding_expanded,
  } = useSelector((state: RootState) => state.motions)
  const { isActive } = useSelector((state: RootState) => state.conference)

  const motionVariants = useMemo(() => {
    // Initial size
    let size: SizeTypes = {
      width: 0,
      height: 0,
      padding: padding_expanded,
    }

    switch (view) {
      case 'call':
        if (isOpen) {
          if (accepted && transferring && conferencing) {
            if (actionsExpanded) {
              size = {
                width: variants.call.expanded.transfer.actionsExpanded.width,
                height: variants.call.expanded.transfer.actionsExpanded.height,
              }
            } else {
              size = {
                width: variants.call.expanded.transfer.width,
                height: variants.call.expanded.transfer.height,
              }
            }
          } else if (accepted && actionsExpanded) {
            size = {
              width: variants.call.expanded.accepted.actionsExpanded.width,
              height: variants.call.expanded.accepted.actionsExpanded.height,
            }
          } else if (accepted && !isListen) {
            size = {
              width: variants.call.expanded.accepted.width,
              height: variants.call.expanded.accepted.height,
            }
          } else if (accepted && isListen) {
            size = {
              width: variants.call.expanded.listening.width,
              height: variants.call.expanded.listening.height,
            }
          } else if (incoming && !isFromStreaming) {
            size = {
              width: variants.call.expanded.incoming.width,
              height: variants.call.expanded.incoming.height,
            }
          } else if (incoming && isFromStreaming) {
            size = {
              width: variants.call.expanded.incomingStreaming.width,
              height: variants.call.expanded.incomingStreaming.height,
            }
          } else if (outgoing && !isFromStreaming) {
            size = {
              width: variants.call.expanded.outgoing.width,
              height: variants.call.expanded.outgoing.height,
            }
          } else if (outgoing && isFromStreaming) {
            size = {
              width: variants.call.expanded.outgoingStreaming.width,
              height: variants.call.expanded.outgoingStreaming.height,
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
        size = isOpen
          ? {
            width: variants.keypad.expanded.width,
            height: variants.keypad.expanded.height,
          }
          : {
            width: variants.transfer.collapsed.width,
            height: variants.transfer.collapsed.height,
          }
        break

      case 'video':
        if (isOpen) {
          size = {
            width: variants.video.expanded.width,
            height: variants.video.expanded.height,
            padding: variants.video.expanded.padding,
          }
        } else {
          size = {
            width: variants.video.collapsed.width,
            height: variants.video.collapsed.height,
          }
        }
        break
      case 'transfer':
      case 'player':
      case 'recorder':
      case 'physicalPhoneRecorder':
      case 'settings':
      case 'conference':
        size = isOpen
          ? {
            width: variants[view].expanded.width,
            height: variants[view].expanded.height,
          }
          : {
            width: variants[view].collapsed.width,
            height: variants[view].collapsed.height,
          }
        break

      case 'switchDevice':
        size = isOpen
          ? {
            width: variants.switchDevice.expanded.width,
            height: variants.switchDevice.expanded.height,
          }
          : {
            width: variants.video.collapsed.width,
            height: variants.video.collapsed.height,
          }
        break

      case 'waitingConference':
        size = isOpen
          ? {
            width: variants.waitingConference.expanded.width,
            height: variants.waitingConference.expanded.height,
          }
          : {
            width: variants.waitingConference.collapsed.width,
            height: variants.waitingConference.collapsed.height,
          }
        break
      case 'streamingAnswer':
        size = isOpen
          ? isExtraLarge
            ? {
              width: variants.streamingAnswer.extraLarge.width,
              height: variants.streamingAnswer.extraLarge.height,
              padding: variants.streamingAnswer.extraLarge.padding,
            }
            : {
              width: variants.streamingAnswer.expanded.width,
              height: variants.streamingAnswer.expanded.height,
              padding: variants.streamingAnswer.expanded.padding,
            }
          : {
            width: variants.streamingAnswer.collapsed.width,
            height: variants.streamingAnswer.collapsed.height,
          }
        break
        case 'operatorBusy':
        size = isOpen
          ? {
            width: variants.operatorBusy.expanded.width,
            height: variants.operatorBusy.expanded.height,
          }
          : {
            width: variants.operatorBusy.collapsed.width,
            height: variants.operatorBusy.collapsed.height,
          }
        break
    }

    const isAlert: boolean = activeAlertsCount > 0

    return {
      width: `${size.width === 0 && isAlert ? variants.alerts.width : size.width}px`,
      height: `${
        // If there is an alert and the island is open put the correct height
        isAlert && isOpen
          ? variants.alerts.height +
          (size.height === 0 ? alert_padding_expanded * 2 : alert_padding_expanded)
          : size.height
        }px`,
      borderRadius: isOpen
        ? `${border_radius_expanded}px`
        : isActive && view === 'waitingConference'
          ? `${border_radius_collapsed_conference}px`
          : `${border_radius_collapsed}px`,
      padding: isOpen
        ? size.padding != undefined
          ? `${size.padding}px`
          : `${padding_expanded}px`
        : `${padding_x_collapsed}px ${padding_y_collapsed}px`,
    }
  }, [
    view,
    isOpen,
    accepted,
    transferring,
    actionsExpanded,
    isListen,
    incoming,
    outgoing,
    activeAlertsCount,
    variants,
    border_radius_collapsed,
    border_radius_expanded,
    padding_x_collapsed,
    padding_y_collapsed,
    padding_expanded,
    alert_padding_expanded,
    incomingWebRTC,
    incomingSocket,
    isActive,
    isFromStreaming,
    isExtraLarge
  ])

  useEffect(() => {
    let sizeInformation: any = {}
    sizeInformation.width = motionVariants?.width
    sizeInformation.height = motionVariants?.height
    eventDispatch('phone-island-size-change', {
      sizeInformation,
    })
  }, [
    motionVariants,
    view,
    isOpen,
    accepted,
    transferring,
    actionsExpanded,
    isListen,
    incoming,
    outgoing,
    activeAlertsCount,
    variants,
    border_radius_collapsed,
    border_radius_expanded,
    padding_x_collapsed,
    padding_y_collapsed,
    padding_expanded,
    alert_padding_expanded,
    sideViewIsVisible,
    transcriptionViewIsVisible,
    incomingSocket,
    incomingWebRTC,
    isActive,
    isExtraLarge,
  ])

  return (
    <motion.div
      className={`${isOpen ? 'pi-cursor-grab' : 'pi-cursor-pointer'
        } pi-pointer-events-auto pi-overflow-hidden dark:pi-bg-gray-950 pi-bg-gray-50 pi-text-xs dark:pi-text-white pi-text-gray-900 hover:pi-shadow-2xl pi-rounded-3xl pi-transition-shadow`}
      animate={motionVariants}
      transition={{
        duration: 0.15,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}

interface IslandMotionProps {
  children: ReactNode
}

type SizeTypes = {
  width: number
  height: number
  padding?: number
}

export default IslandMotion
