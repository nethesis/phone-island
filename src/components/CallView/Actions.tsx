// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import {
  faPause as faPauseRegular,
  faMicrophone as faMicrophoneLight,
  faArrowDownArrowUp,
} from '@nethesis/nethesis-light-svg-icons'
import {
  muteCurrentCall,
  unmuteCurrentCall,
  pauseCurrentCall,
  unpauseCurrentCall,
} from '../../lib/phone/call'
import PhoneKeypadLight from '../../static/icons/PhoneKeypadLight'
import PhoneKeypadSolid from '../../static/icons/PhoneKeypadSolid'
import { Button } from '../'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMicrophoneSlash,
  faPlay,
  faArrowDownUpAcrossLine,
} from '@nethesis/nethesis-solid-svg-icons'
import { RootState, Dispatch } from '../../store'
import { useSelector, useDispatch } from 'react-redux'
import { sendDTMF } from '../../lib/webrtc/messages'
import { store } from '../../store'
import outgoingRingtone from '../../static/outgoing_ringtone'
import { TransferActions } from '../TransferView'

const Actions: FC = () => {
  // Get multiple values from currentCall store
  const { paused, muted } = useSelector((state: RootState) => state.currentCall)

  // Get isOpen and view from island store
  const { view } = useSelector((state: RootState) => state.island)
  const { transferring } = useSelector((state: RootState) => state.currentCall)

  const dispatch = useDispatch<Dispatch>()

  function openKeypad() {
    dispatch.island.setIslandView(view !== 'keypad' ? 'keypad' : 'call')
  }

  function transfer() {
    dispatch.island.setIslandView(view !== 'transfer' ? 'transfer' : 'call')
  }

  // Cancels the current transfer through dtmfs
  function calcelTransfer() {
    sendDTMF('*')
    const { audioPlayerPlaying } = store.getState().player
    // Check if the local audio is already playing and start playing
    if (!audioPlayerPlaying) {
      dispatch.player.updateAndPlayAudioPlayer({
        src: outgoingRingtone,
        loop: true,
      })
    }
    setTimeout(() => {
      sendDTMF('1')
      dispatch.player.stopAudioPlayer()
    }, 500)
  }

  return (
    <>
      <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
        <Button
          variant='default'
          active={paused ? true : false}
          onClick={() => (paused ? unpauseCurrentCall() : pauseCurrentCall())}
        >
          {paused ? (
            <FontAwesomeIcon size='xl' icon={faPlay} />
          ) : (
            <FontAwesomeIcon size='xl' icon={faPauseRegular} />
          )}
        </Button>
        <Button
          variant='default'
          active={muted ? true : false}
          onClick={() => (muted ? unmuteCurrentCall() : muteCurrentCall())}
        >
          {muted ? (
            <FontAwesomeIcon size='xl' icon={faMicrophoneSlash} />
          ) : (
            <FontAwesomeIcon size='xl' icon={faMicrophoneLight} />
          )}
        </Button>
        <Button
          active={transferring}
          onClick={transferring ? calcelTransfer : transfer}
          variant='default'
        >
          {transferring ? (
            <FontAwesomeIcon className='' size='xl' icon={faArrowDownUpAcrossLine} />
          ) : (
            <FontAwesomeIcon size='xl' icon={faArrowDownArrowUp} />
          )}
        </Button>
        <Button active={view === 'keypad'} variant='default' onClick={openKeypad}>
          {view === 'keypad' ? <PhoneKeypadSolid /> : <PhoneKeypadLight />}
        </Button>
      </div>
      {transferring && <TransferActions />}
    </>
  )
}

export default Actions
