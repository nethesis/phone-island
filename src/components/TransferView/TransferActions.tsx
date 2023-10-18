// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRepeat } from '@nethesis/nethesis-light-svg-icons'
import { sendDTMF } from '../../lib/webrtc/messages'
import { store, Dispatch } from '../../store'
import { useDispatch, useSelector } from 'react-redux'
import outgoingRingtone from '../../static/outgoing_ringtone'
import { RootState } from '../../store'
import { Tooltip } from 'react-tooltip/dist/react-tooltip.min.cjs'

export const TransferActions: FC<TransferActionsProps> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { transferCalls, number } = useSelector((state: RootState) => state.currentCall)

  // Cancels the current transfer through dtmfs
  function switchTransfer() {
    dispatch.currentCall.updateTransferSwitching(true)
    // Start sending the DTMFs for transferring
    sendDTMF('*')
    const { audioPlayerPlaying } = store.getState().player
    // Check if the local audio is already playing and start playing
    if (!audioPlayerPlaying) {
      dispatch.player.updateStartAudioPlayer({
        src: outgoingRingtone,
        loop: true,
      })
    }
    setTimeout(() => {
      // Send the second DTMF for transferring
      sendDTMF('4')
      dispatch.player.stopAudioPlayer()
    }, 500)
  }

  return (
    <>
      <div className='pi-grid pi-grid-cols-3 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
        <div></div>
        <Button
          onClick={switchTransfer}
          variant='default'
          data-tooltip-id='transfer-actions-tooltip'
          data-tooltip-content='Switch calls'
        >
          <FontAwesomeIcon size='xl' icon={faArrowsRepeat} />
        </Button>
        <div></div>
      </div>
      <Tooltip className='pi-z-1000' id='transfer-actions-tooltip' place='bottom' />
    </>
  )
}

interface TransferActionsProps {}

interface CurrentCallsTypes {
  [name: string]: {
    name: string
    time: string
  }
}
