// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import React, { type FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../store'
import { Button } from './Button'
import { eventDispatch } from '../utils'
import { isWebRTC } from '../lib/user/default_device'
import { sendDTMF } from '../lib/webrtc/messages'
import { sendPhysicalDTMF } from '../services/astproxy'
import outgoingRingtone from '../static/outgoing_ringtone'
import { faArrowDownUpAcrossLine, faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { PlacesType, Tooltip } from 'react-tooltip'

interface TransferButtonProps {
  tooltipPlace?: PlacesType
}

export const TransferButton: FC<TransferButtonProps> = ({ tooltipPlace = 'bottom' }) => {
  const { view, sideViewIsVisible } = useSelector((state: RootState) => state.island)
  const dispatch = useDispatch<Dispatch>()
  const transferring = useSelector((state: RootState) => state.currentCall.transferring)
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)

  function transfer() {
    // Open the transfer view

    dispatch.island.setIslandView(view !== 'transfer' ? 'transfer' : 'call')
    // Check if sideView is visible and close it
    if (sideViewIsVisible) {
      eventDispatch('phone-island-sideview-close', {})
    }
    eventDispatch('phone-island-call-transfer-opened', {})
  }

  // Cancels the current transfer through dtmfs
  function cancelTransfer() {
    if (isWebRTC()) {
      sendDTMF('*')
    } else {
      sendPhysicalDTMF('*')
    }

    const { audioPlayerPlaying } = store.getState().player
    // Check if the local audio is already playing and start playing
    if (!audioPlayerPlaying) {
      dispatch.player.updateStartAudioPlayer({
        src: outgoingRingtone,
        loop: true,
      })
    }
    setTimeout(() => {
      if (isWebRTC()) {
        sendDTMF('1')
      } else {
        sendPhysicalDTMF('1')
      }

      dispatch.player.stopAudioPlayer()
      // The workaround to disable transfer because of the wrong conv.connection value from ws
      if (transferring) {
        setTimeout(() => {
          dispatch.currentCall.updateTransferring(false)
        }, 500)
      }

      eventDispatch('phone-island-call-transfer-canceled', {})
    }, 500)
  }

  return (
    <>
      {!(intrudeListenStatus.isIntrude || intrudeListenStatus.isListen) && (
        <>
          <Button
            active={transferring}
            onClick={transferring ? cancelTransfer : transfer}
            variant='default'
            data-tooltip-id='tooltip-transfer'
            data-tooltip-content={
              transferring ? `${t('Tooltip.Cancel transfer')}` : `${t('Tooltip.Transfer')}`
            }
          >
            {transferring ? (
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faArrowDownUpAcrossLine} />
            ) : (
              <FontAwesomeIcon
                className='pi-rotate-90 pi-h-6 pi-w-6'
                icon={faArrowRightArrowLeft}
              />
            )}
          </Button>
          <Tooltip className='pi-z-20' id='tooltip-transfer' place={tooltipPlace} />
        </>
      )}
    </>
  )
}

export default TransferButton
