// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useMemo, useEffect, useRef, useCallback } from 'react'
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
  faSquareParking,
  faUserPlus,
  faPlus,
  faAngleDown,
  faAngleUp,
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
import { IconDefinition } from '@fortawesome/fontawesome-common-types'

interface ActionButtonProps {
  active: boolean
  onClick: () => void
  tooltipId: string
  tooltipContent: string
  icon: IconDefinition
  activeIcon?: IconDefinition
}

const ActionButton: React.FC<ActionButtonProps> = React.memo(
  ({ active, onClick, tooltipId, tooltipContent, icon, activeIcon = icon }) => (
    <Button
      variant='default'
      active={active}
      onClick={onClick}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltipContent}
    >
      <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={active ? activeIcon : icon} />
    </Button>
  ),
)

const Actions: FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch<Dispatch>()

  const { paused, muted, parked, transferring } = useSelector(
    (state: RootState) => state.currentCall,
  )
  const { view, actionsExpanded, sideViewIsVisible } = useSelector(
    (state: RootState) => state.island,
  )
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)
  const { isActive, conferenceStartedFrom } = useSelector((state: RootState) => state.conference)
  const { username, profile } = useSelector((state: RootState) => state?.currentUser)

  // Check if the actions should be expanded automatically
  const autoExpandedRef = useRef(false)
  // Check if the actions should be collapsed automatically
  const autoCollapsedRef = useRef(false)

  const isOwnerOfConference = useMemo(
    () => username !== '' && conferenceStartedFrom === username,
    [username, conferenceStartedFrom],
  )

  const shouldHideTransferButton = useMemo(
    () => isActive && !isOwnerOfConference,
    [isActive, isOwnerOfConference],
  )

  const shouldHideButtons = useMemo(
    () => intrudeListenStatus?.isIntrude || intrudeListenStatus?.isListen,
    [intrudeListenStatus],
  )

  const toggleMute = useCallback(() => {
    muted ? unmuteCurrentCall() : muteCurrentCall()
  }, [muted])

  const togglePause = useCallback(() => {
    paused ? unpauseCurrentCall() : pauseCurrentCall()
  }, [paused])

  const openKeypad = useCallback(() => {
    dispatch.island.setIslandView(view !== 'keypad' ? 'keypad' : 'call')
    if (sideViewIsVisible) {
      eventDispatch('phone-island-sideview-close', {})
    }
    eventDispatch('phone-island-call-keypad-opened', {})
  }, [view, sideViewIsVisible, dispatch.island])

  const toggleActionsExpanded = useCallback(() => {
    const newState = !actionsExpanded
    dispatch.island.toggleActionsExpanded(newState)
    eventDispatch(`phone-island-call-actions-${newState ? 'opened' : 'closed'}`, {})
    if (!newState) {
      eventDispatch('phone-island-sideview-close', {})
    }
  }, [actionsExpanded, dispatch.island])

  const toggleSideView = useCallback(() => {
    const event = sideViewIsVisible ? 'phone-island-sideview-close' : 'phone-island-sideview-open'
    eventDispatch(event, {})
  }, [sideViewIsVisible])

  const transfer = useCallback(() => {
    dispatch.island.setIslandView(view !== 'transfer' ? 'transfer' : 'call')
    if (sideViewIsVisible) {
      eventDispatch('phone-island-sideview-close', {})
    }
    eventDispatch('phone-island-call-transfer-opened', {})
  }, [view, sideViewIsVisible, dispatch.island])

  const beginConference = useCallback(() => {
    eventDispatch('phone-island-conference-list-open', {})
    dispatch.island.setIslandView(view !== 'transfer' ? 'transfer' : 'call')
    if (sideViewIsVisible) {
      eventDispatch('phone-island-sideview-close', {})
    }
  }, [view, sideViewIsVisible, dispatch.island])

  const addUserToConference = useCallback(async () => {
    dispatch.island.setIslandView('waitingConference')
    await startConference()
  }, [dispatch.island])

  const handleConferenceAction = useCallback(() => {
    isActive ? addUserToConference() : beginConference()
  }, [isActive, addUserToConference, beginConference])

  const shouldExpandActions = useMemo(() => {
    return (
      isActive &&
      view === 'call' &&
      !actionsExpanded &&
      !autoExpandedRef.current &&
      isOwnerOfConference
    )
  }, [isActive, view, actionsExpanded, isOwnerOfConference])

  // Check if user is not the owner of the conference
  const shouldCollapseActions = useMemo(() => {
    return (
      isActive &&
      view === 'call' &&
      actionsExpanded &&
      !autoCollapsedRef.current &&
      username !== '' &&
      !isOwnerOfConference
    )
  }, [isActive, view, actionsExpanded, username, isOwnerOfConference])

  // Automatically expand actions if the user has enabled conference
  useEffect(() => {
    if (shouldExpandActions) {
      dispatch.island.toggleActionsExpanded(true)
      eventDispatch('phone-island-call-actions-opened', {})
      autoExpandedRef.current = true
    }
  }, [shouldExpandActions, dispatch.island])

  // Automatically collapse actions if the user is not the owner of the conference
  useEffect(() => {
    if (shouldCollapseActions) {
      dispatch.island.toggleActionsExpanded(false)
      eventDispatch('phone-island-call-actions-closed', {})
      autoCollapsedRef.current = true
    }
  }, [shouldCollapseActions, dispatch.island])

  const cancelTransfer = useCallback(() => {
    const sendDtmfFunc = isWebRTC() ? sendDTMF : sendPhysicalDTMF

    sendDtmfFunc('*')

    const { audioPlayerPlaying } = store.getState().player
    // Check if the local audio is already playing and start playing
    if (!audioPlayerPlaying) {
      dispatch.player.updateStartAudioPlayer({
        src: outgoingRingtone,
        loop: true,
      })
    }

    setTimeout(() => {
      sendDtmfFunc('1')
      dispatch.player.stopAudioPlayer()
      // The workarround to disable transfer because of the wrong conv.connection value from ws
      if (transferring) {
        setTimeout(() => {
          dispatch.currentCall.updateTransferring(false)
        }, 500)
      }

      eventDispatch('phone-island-call-transfer-canceled', {})
    }, 500)
  }, [transferring, dispatch.player, dispatch.currentCall])

  useEventListener('phone-island-call-keypad-open', openKeypad)
  useEventListener('phone-island-call-transfer-open', transfer)
  useEventListener('phone-island-call-transfer-cancel', cancelTransfer)
  useEventListener('phone-island-call-actions-open', () => {
    dispatch.island.toggleActionsExpanded(true)
    eventDispatch('phone-island-call-actions-opened', {})
  })
  useEventListener('phone-island-call-actions-close', () => {
    dispatch.island.toggleActionsExpanded(false)
    eventDispatch('phone-island-call-actions-closed', {})
  })

  const mainGridClassName = useMemo(() => {
    if (
      intrudeListenStatus?.isListen ||
      intrudeListenStatus?.isIntrude ||
      (isActive && !isOwnerOfConference)
    ) {
      if (intrudeListenStatus.isIntrude) {
        return 'pi-mb-6 pi-grid pi-grid-cols-1 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'
      }
      if (isActive && !isOwnerOfConference) {
        return 'pi-flex pi-items-center pi-justify-center pi-gap-4'
      }
      return 'pi-hidden'
    }
    return 'pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'
  }, [intrudeListenStatus, isActive, isOwnerOfConference])

  return (
    <>
      <div className={mainGridClassName}>
        {!shouldHideButtons && (
          <ActionButton
            active={paused}
            onClick={togglePause}
            tooltipId='tooltip-pause'
            tooltipContent={paused ? t('Tooltip.Play') : t('Tooltip.Pause')}
            icon={faPause}
            activeIcon={faPlay}
          />
        )}

        {!intrudeListenStatus?.isListen && (
          <ActionButton
            active={muted}
            onClick={toggleMute}
            tooltipId='tooltip-mute'
            tooltipContent={muted ? t('Tooltip.Unmute') : t('Tooltip.Mute')}
            icon={faMicrophone}
            activeIcon={faMicrophoneSlash}
          />
        )}

        {!shouldHideTransferButton && <TransferButton />}

        {!shouldHideButtons && !shouldHideTransferButton && (
          <Button
            active={actionsExpanded}
            variant='transparent'
            onClick={toggleActionsExpanded}
            data-tooltip-id='tooltip-expand'
            data-tooltip-content={actionsExpanded ? t('Tooltip.Collapse') : t('Tooltip.Expand')}
          >
            <FontAwesomeIcon
              className='pi-h-6 pi-w-6'
              icon={actionsExpanded ? faAngleUp : faAngleDown}
            />
          </Button>
        )}
      </div>

      {/* Actions expanded section */}
      {actionsExpanded && (
        <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
          <ActionButton
            active={view === 'keypad'}
            onClick={openKeypad}
            tooltipId='tooltip-keyboard'
            tooltipContent={t('Tooltip.Keyboard')}
            icon={faGridRound}
          />

          <ActionButton
            active={parked}
            onClick={parkCurrentCall}
            tooltipId='tooltip-park'
            tooltipContent={t('Tooltip.Park')}
            icon={faSquareParking}
          />

          {profile?.macro_permissions?.settings?.permissions?.conference?.value && (
            <Button
              data-stop-propagation={true}
              variant='default'
              onClick={handleConferenceAction}
              data-tooltip-id='tooltip-conference'
              data-tooltip-content={
                isActive ? t('Tooltip.Conference') || '' : t('Tooltip.Add user to conference') || ''
              }
            >
              <FontAwesomeIcon icon={isActive ? faPlus : faUserPlus} className='pi-h-6 pi-w-6' />
            </Button>
          )}

          <Button
            variant='default'
            onClick={toggleSideView}
            data-tooltip-id='tooltip-sideView'
            data-tooltip-content={t('Tooltip.Other actions') || ''}
          >
            <FontAwesomeIcon
              className='pi-h-6 pi-w-6'
              icon={sideViewIsVisible ? faClose : faOpen}
            />
          </Button>
        </div>
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

export default React.memo(Actions)
