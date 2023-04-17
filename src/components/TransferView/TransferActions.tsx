// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useState } from 'react'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faArrowsRepeat } from '@nethesis/nethesis-light-svg-icons'
import { faArrowsRepeat as faArrowsRepeatSolid } from '@nethesis/nethesis-solid-svg-icons'
import { sendDTMF } from '../../lib/webrtc/messages'
import { store, Dispatch } from '../../store'
import { useDispatch, useSelector } from 'react-redux'
import outgoingRingtone from '../../static/outgoing_ringtone'
import { RootState } from '../../store'

export const TransferActions: FC<TransferActionsProps> = () => {
  const dispatch = useDispatch<Dispatch>()
  const {
    transferSwitching,
    transferringName,
    transferringStartTime,
    displayName,
    startTime,
    number,
  } = useSelector((state: RootState) => state.currentCall)
  const [firstSwitch, setFirstSwitch] = useState<boolean>(true)
  const [currentCalls, setCurrentCalls] = useState<CurrentCallsTypes>({})
  const [frontName, setFrontName] = useState<string>('')
  const [backName, setBackName] = useState<string>('')

  // Cancels the current transfer through dtmfs
  function switchTransfer() {
    if (firstSwitch) {
      // Save current calls info
      setCurrentCalls({
        [displayName]: {
          name: displayName,
          time: startTime,
        },
        [transferringName]: {
          name: transferringName,
          time: transferringStartTime,
        },
      })
      // Set firstSwitch
      setFirstSwitch(false)
    }
    setFrontName(displayName)
    setBackName(transferringName)
    // Set transferSwitching
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

  useEffect(() => {
    if (transferSwitching) {
      // Update transferringName
      dispatch.currentCall.updateCurrentCall({
        transferringName: currentCalls[frontName].name,
        transferringStartTime: currentCalls[frontName].time,
      })
      // Set transfer when displayName was already changed
      dispatch.currentCall.updateTransferSwitching(false)
    }
  }, [displayName])

  useEffect(() => {
    if (backName && currentCalls[backName]) {
      // Update transferringName
      dispatch.currentCall.updateCurrentCall({
        startTime: currentCalls[backName].time,
      })
    }
  }, [startTime])

  return (
    <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
      <div></div>
      <Button onClick={switchTransfer} active={transferSwitching} variant='default'>
        {transferSwitching ? (
          <FontAwesomeIcon size='xl' icon={faArrowsRepeatSolid} />
        ) : (
          <FontAwesomeIcon size='xl' icon={faArrowsRepeat} />
        )}
      </Button>
      <Button variant='default'>
        <FontAwesomeIcon size='xl' icon={faUsers} />
      </Button>
      <div></div>
    </div>
  )
}

interface TransferActionsProps {}

interface CurrentCallsTypes {
  [name: string]: {
    name: string
    time: string
  }
}
