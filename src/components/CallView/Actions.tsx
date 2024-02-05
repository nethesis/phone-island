// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import {
  muteCurrentCall,
  unmuteCurrentCall,
  pauseCurrentCall,
  unpauseCurrentCall,
  attendedTransfer,
} from '../../lib/phone/call'
import { Button } from '../'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPause,
  faPlay,
  faMicrophone,
  faMicrophoneSlash,
  faArrowDownUpAcrossLine,
  faSquareParking,
  faChevronDown,
  faChevronUp,
  faArrowRightArrowLeft,
} from '@fortawesome/free-solid-svg-icons'
import { faGridRound } from '@nethesis/nethesis-solid-svg-icons'
import { RootState, Dispatch } from '../../store'
import { useSelector, useDispatch } from 'react-redux'
import { sendDTMF } from '../../lib/webrtc/messages'
import { store } from '../../store'
import outgoingRingtone from '../../static/outgoing_ringtone'
import { TransferActions } from '../TransferView'
import { Tooltip } from 'react-tooltip/dist/react-tooltip.min.cjs'
import { park } from '../../lib/phone/call'
import { eventDispatch, useEventListener } from '../../utils'
import { useTranslation } from 'react-i18next'

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
    eventDispatch('phone-island-call-parked', {})
  }



  const { t } = useTranslation()

  // Phone island header section
  return (
    <>
      <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
        <Button
          variant='default'
          active={paused ? true : false}
          onClick={() => (paused ? unpauseCurrentCall() : pauseCurrentCall())}
          data-tooltip-id='tooltip'
          data-tooltip-content={paused ? `${t('Tooltip.Play')}` : `${t('Tooltip.Pause')}`}
        >
          {paused ? (
            <FontAwesomeIcon size='xl' icon={faPlay} />
          ) : (
            <FontAwesomeIcon size='xl' icon={faPause} />
          )}
        </Button>

        <Button
          variant='default'
          active={muted ? true : false}
          onClick={() => (muted ? unmuteCurrentCall() : muteCurrentCall())}
          data-tooltip-id='tooltip'
          data-tooltip-content={muted ? `${t('Tooltip.Unmute')}` : `${t('Tooltip.Mute')}`}
        >
          {muted ? (
            <FontAwesomeIcon size='xl' icon={faMicrophoneSlash} />
          ) : (
            <FontAwesomeIcon size='xl' icon={faMicrophone} />
          )}
        </Button>

        <Button
          active={transferring}
          onClick={transferring ? calcelTransfer : transfer}
          variant='default'
          data-tooltip-id='tooltip'
          data-tooltip-content={
            transferring ? `${t('Tooltip.Cancel transfer')}` : `${t('Tooltip.Transfer')}`
          }
        >
          {transferring ? (
            <FontAwesomeIcon className='' size='xl' icon={faArrowDownUpAcrossLine} />
          ) : (
            <FontAwesomeIcon size='xl' className='pi-rotate-90' icon={faArrowRightArrowLeft} />
          )}
        </Button>

        <Button
          active={actionsExpanded}
          variant='transparent'
          onClick={() => toggleActionsExpanded()}
          data-tooltip-id='tooltip'
          data-tooltip-content={
            actionsExpanded ? `${t('Tooltip.Collapse')}` : `${t('Tooltip.Expand')}`
          }
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
              data-tooltip-content={t('Tooltip.Keyboard')}
            >
              <FontAwesomeIcon size='xl' icon={faGridRound} />
            </Button>
            <Button
              active={parked}
              variant='default'
              onClick={parkAction}
              data-tooltip-id='tooltip'
              data-tooltip-content={t('Tooltip.Park')}
            >
              <FontAwesomeIcon size='xl' icon={faSquareParking} />
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
