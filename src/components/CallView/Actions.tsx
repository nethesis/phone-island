// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import {
  muteCurrentCall,
  unmuteCurrentCall,
  pauseCurrentCall,
  unpauseCurrentCall,
  parkCurrentCall,
  startConference,
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
  faUserPlus,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { faClose, faGridRound, faOpen } from '@nethesis/nethesis-solid-svg-icons'
import { RootState, Dispatch } from '../../store'
import { useSelector, useDispatch } from 'react-redux'
import { sendDTMF } from '../../lib/webrtc/messages'
import { store } from '../../store'
import outgoingRingtone from '../../static/outgoing_ringtone'
import { useTranslation } from 'react-i18next'
import { useEventListener, eventDispatch } from '../../utils'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import TransferButton from '../TransferButton'
import { isWebRTC } from '../../lib/user/default_device'
import { sendPhysicalDTMF } from '../../services/astproxy'

const Actions: FC = () => {
  // Get multiple values from currentCall store
  const { paused, muted, isRecording } = useSelector((state: RootState) => state.currentCall)
  const parked = useSelector((state: RootState) => state.currentCall.parked)

  // Get isOpen and view from island store
  const { view, actionsExpanded, sideViewIsVisible, isConferenceList } = useSelector(
    (state: RootState) => state.island,
  )
  const transferring = useSelector((state: RootState) => state.currentCall.transferring)
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)
  const { isActive } = useSelector((state: RootState) => state.conference)

  const dispatch = useDispatch<Dispatch>()

  function openKeypad() {
    dispatch.island.setIslandView(view !== 'keypad' ? 'keypad' : 'call')
    // Check if sideView is visible and close it
    if (sideViewIsVisible) {
      eventDispatch('phone-island-sideview-close', {})
    }
    eventDispatch('phone-island-call-keypad-opened', {})
  }
  useEventListener('phone-island-call-keypad-open', () => {
    openKeypad()
  })

  function transfer() {
    // Open the transfer view
    dispatch.island.setIslandView(view !== 'transfer' ? 'transfer' : 'call')
    // Check if sideView is visible and close it
    if (sideViewIsVisible) {
      eventDispatch('phone-island-sideview-close', {})
    }
    eventDispatch('phone-island-call-transfer-opened', {})
  }

  useEventListener('phone-island-call-transfer-open', () => {
    transfer()
  })
  useEventListener('phone-island-call-transfer-cancel', () => {
    cancelTransfer()
  })

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
      // The workarround to disable transfer because of the wrong conv.connection value from ws
      if (transferring) {
        setTimeout(() => {
          dispatch.currentCall.updateTransferring(false)
        }, 500)
      }

      eventDispatch('phone-island-call-transfer-canceled', {})
    }, 500)
  }

  useEventListener('phone-island-call-actions-open', () => {
    dispatch.island.toggleActionsExpanded(true)
    eventDispatch('phone-island-call-actions-opened', {})
  })
  useEventListener('phone-island-call-actions-close', () => {
    dispatch.island.toggleActionsExpanded(false)
    eventDispatch('phone-island-call-actions-closed', {})
  })
  function toggleActionsExpanded() {
    if (actionsExpanded) {
      dispatch.island.toggleActionsExpanded(false)
      eventDispatch('phone-island-call-actions-closed', {})
      eventDispatch('phone-island-sideview-close', {})
    } else {
      dispatch.island.toggleActionsExpanded(true)
      eventDispatch('phone-island-call-actions-opened', {})
    }
  }

  const beginConference = () => {
    // Update island store and set conference list view to true
    dispatch.island.toggleConferenceList(isConferenceList ? false : true)
    // Set the island view to transfer list
    dispatch.island.setIslandView(view !== 'transfer' ? 'transfer' : 'call')
    // Check if sideView is visible and close it
    if (sideViewIsVisible) {
      eventDispatch('phone-island-sideview-close', {})
    }
    eventDispatch('phone-island-call-conference-list-opened', {})
  }

  const addUserToConference = async () => {
    const conferenceStarted = await startConference()
    if (conferenceStarted) {
      dispatch.island.setIslandView('waitingConference')
    }
  }

  const { t } = useTranslation()
  // Phone island header section
  return (
    <>
      <div
        className={`${
          !intrudeListenStatus?.isListen && !intrudeListenStatus?.isIntrude
            ? 'pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'
            : intrudeListenStatus.isIntrude
            ? 'pi-mb-6 pi-grid pi-grid-cols-1 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'
            : 'pi-hidden'
        } `}
      >
        {!(intrudeListenStatus?.isIntrude || intrudeListenStatus?.isListen) && (
          <Button
            variant='default'
            active={paused ? true : false}
            onClick={() => (paused ? unpauseCurrentCall() : pauseCurrentCall())}
            data-tooltip-id='tooltip-pause'
            data-tooltip-content={paused ? `${t('Tooltip.Play')}` : `${t('Tooltip.Pause')}`}
          >
            {paused ? (
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPlay} />
            ) : (
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPause} />
            )}
          </Button>
        )}
        {!intrudeListenStatus?.isListen && (
          <Button
            variant='default'
            active={muted ? true : false}
            onClick={() => (muted ? unmuteCurrentCall() : muteCurrentCall())}
            data-tooltip-id='tooltip-mute'
            data-tooltip-content={muted ? `${t('Tooltip.Unmute')}` : `${t('Tooltip.Mute')}`}
          >
            {muted ? (
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faMicrophoneSlash} />
            ) : (
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faMicrophone} />
            )}
          </Button>
        )}

        <TransferButton />

        {!(intrudeListenStatus.isIntrude || intrudeListenStatus.isListen) && (
          <Button
            active={actionsExpanded}
            variant='transparent'
            onClick={() => toggleActionsExpanded()}
            data-tooltip-id='tooltip-expand'
            data-tooltip-content={
              actionsExpanded ? `${t('Tooltip.Collapse')}` : `${t('Tooltip.Expand')}`
            }
          >
            {actionsExpanded ? (
              <FontAwesomeIcon
                className='pi-text-gray-700 dark:pi-text-gray-200 pi-h-6 pi-w-6'
                icon={faChevronUp}
              />
            ) : (
              <FontAwesomeIcon
                className='pi-text-gray-700 dark:pi-text-gray-200 pi-h-6 pi-w-6'
                icon={faChevronDown}
              />
            )}
          </Button>
        )}
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
              data-tooltip-id='tooltip-keyboard'
              data-tooltip-content={t('Tooltip.Keyboard') || ''}
            >
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faGridRound} />
            </Button>
            <Button
              active={parked}
              variant='default'
              onClick={parkCurrentCall}
              data-tooltip-id='tooltip-park'
              data-tooltip-content={t('Tooltip.Park') || ''}
            >
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faSquareParking} />
            </Button>
            <Button
              data-stop-propagation={true}
              variant='default'
              onClick={() => (isActive ? addUserToConference() : beginConference())}
              data-tooltip-id='tooltip-conference'
              data-tooltip-content={
                isActive ? t('Tooltip.Conference') || '' : t('Tooltip.Add user to conference') || ''
              }
            >
              <FontAwesomeIcon icon={isActive ? faPlus : faUserPlus} className='pi-h-6 pi-w-6' />
            </Button>
            <Button
              variant='default'
              onClick={() =>
                sideViewIsVisible
                  ? eventDispatch('phone-island-sideview-close', {})
                  : eventDispatch('phone-island-sideview-open', {})
              }
              data-tooltip-id='tooltip-sideView'
              data-tooltip-content={t('Tooltip.Other actions') || ''}
            >
              <FontAwesomeIcon
                className='pi-h-6 pi-w-6'
                icon={sideViewIsVisible ? faClose : faOpen}
              />
            </Button>
          </div>
        </>
      ) : (
        <></>
      )}
      {/* Buttons tooltips */}
      <CustomThemedTooltip id='tooltip-transfer' place='bottom' />
      <CustomThemedTooltip id='tooltip-pause' place='bottom' />
      <CustomThemedTooltip id='tooltip-mute' place='bottom' />
      <CustomThemedTooltip id='tooltip-expand' place='bottom' />
      <CustomThemedTooltip id='tooltip-keyboard' place='bottom' />
      <CustomThemedTooltip id='tooltip-conference' place='bottom' />
      <CustomThemedTooltip id='tooltip-park' place='bottom' />
      <CustomThemedTooltip id='tooltip-sideView' place='left' />
    </>
  )
}

export default Actions
