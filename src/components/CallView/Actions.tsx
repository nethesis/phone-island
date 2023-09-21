// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import {
  faPause as faPauseRegular,
  faMicrophone as faMicrophoneLight,
  faArrowDownArrowUp,
  faCircleParking,
  faChevronDown,
  faChevronUp,
} from '@nethesis/nethesis-light-svg-icons'
import {
  muteCurrentCall,
  unmuteCurrentCall,
  pauseCurrentCall,
  unpauseCurrentCall,
  attendedTransfer,
} from '../../lib/phone/call'
import PhoneKeypadLight from '../../static/icons/PhoneKeypadLight'
import PhoneKeypadSolid from '../../static/icons/PhoneKeypadSolid'
import { Button } from '../'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMicrophoneSlash,
  faPlay,
  faArrowDownUpAcrossLine,
  faCircleParking as faCircleParkingSolid,
} from '@nethesis/nethesis-solid-svg-icons'
import { RootState, Dispatch } from '../../store'
import { useSelector, useDispatch } from 'react-redux'
import { sendDTMF } from '../../lib/webrtc/messages'
import { store } from '../../store'
import outgoingRingtone from '../../static/outgoing_ringtone'
import { TransferActions } from '../TransferView'
import { Tooltip } from 'react-tooltip/dist/react-tooltip.min.cjs'
import { park } from '../../lib/phone/call'
import { useEventListener } from '../../utils'

const Actions: FC = () => {
  // Get multiple values from currentCall store
  const { paused, muted } = useSelector((state: RootState) => state.currentCall)
  const parked = useSelector((state: RootState) => state.currentCall.parked)

  // Get isOpen and view from island store
  const { view, actionsExpanded } = useSelector((state: RootState) => state.island)
  const transferring = useSelector((state: RootState) => state.currentCall.transferring)

  const dispatch = useDispatch<Dispatch>()

  function openKeypad() {
    dispatch.island.setIslandView(view !== 'keypad' ? 'keypad' : 'call')
  }

  function transfer() {
    // Open the transfer view
    dispatch.island.setIslandView(view !== 'transfer' ? 'transfer' : 'call')
    // Pause the call
    pauseCurrentCall()
  }

  // Cancels the current transfer through dtmfs
  function calcelTransfer() {
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
      sendDTMF('1')
      dispatch.player.stopAudioPlayer()
      // The workarround to disable transfer because of the wrong conv.connection value from ws
      if (transferring) {
        setTimeout(() => {
          dispatch.currentCall.updateTransferring(false)
        }, 500)
      }
    }, 500)
  }

  function toggleActionsExpanded() {
    if (actionsExpanded) {
      dispatch.island.toggleActionsExpanded(false)
    } else {
      dispatch.island.toggleActionsExpanded(true)
    }
  }

  function parkAction() {
    park()
    dispatch.currentCall.setParked(true)
  }

  /**
   * Event listner for phone-island-transfer-call event
   */
  useEventListener('phone-island-transfer-call', (data) => {
    const transferNumber = data.to
    handleAttendedTransfer(transferNumber)
  })

  async function handleAttendedTransfer(number: string) {
    // Send attended transfer message
    const transferringMessageSent = await attendedTransfer(number)
    if (transferringMessageSent) {
      // Set transferring and disable pause
      dispatch.currentCall.updateCurrentCall({
        transferring: true,
        paused: false,
      })
      // Play the remote audio element
      dispatch.player.playRemoteAudio()
    }
  }

  return (
    <>
      <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
        <Button
          variant='default'
          active={paused ? true : false}
          onClick={() => (paused ? unpauseCurrentCall() : pauseCurrentCall())}
          data-tooltip-id='tooltip'
          data-tooltip-content={paused ? 'Play' : 'Pause'}
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
          data-tooltip-id='tooltip'
          data-tooltip-content={muted ? 'Unmute' : 'Mute'}
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
          data-tooltip-id='tooltip'
          data-tooltip-content={transferring ? 'Cancel transfer' : 'Transfer'}
        >
          {transferring ? (
            <FontAwesomeIcon className='' size='xl' icon={faArrowDownUpAcrossLine} />
          ) : (
            <FontAwesomeIcon size='xl' icon={faArrowDownArrowUp} />
          )}
        </Button>
        <Button
          active={actionsExpanded}
          variant='transparent'
          onClick={() => toggleActionsExpanded()}
          data-tooltip-id='tooltip'
          data-tooltip-content={actionsExpanded ? 'Collapse' : 'Expand'}
        >
          {actionsExpanded ? (
            <FontAwesomeIcon className='' size='xl' icon={faChevronUp} />
          ) : (
            <FontAwesomeIcon size='xl' icon={faChevronDown} />
          )}
        </Button>
      </div>
      {/* Actions expanded section */}
      {actionsExpanded ? (
        <>
          {' '}
          <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
            <Button
              active={view === 'keypad'}
              variant='default'
              onClick={openKeypad}
              data-tooltip-id='tooltip'
              data-tooltip-content='Keyboard'
            >
              {view === 'keypad' ? <PhoneKeypadSolid /> : <PhoneKeypadLight />}
            </Button>
            <Button
              active={parked}
              variant='default'
              onClick={parkAction}
              data-tooltip-id='tooltip'
              data-tooltip-content='Park'
            >
              <FontAwesomeIcon size='xl' icon={parked ? faCircleParkingSolid : faCircleParking} />
            </Button>
            {transferring && <TransferActions />}
          </div>
        </>
      ) : (
        <></>
      )}
      {/* Buttons tooltips */}
      <Tooltip className='pi-z-20' id='tooltip' place='bottom' />
    </>
  )
}

export default Actions
