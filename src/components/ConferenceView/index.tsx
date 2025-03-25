// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { useTranslation } from 'react-i18next'
import Hangup from '../Hangup'
import ConferenceUsersList from './ConferenceUsersList'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRightToBracket,
  faMicrophone,
  faMicrophoneSlash,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import { eventDispatch } from '../../utils'
import Timer from '../CallView/Timer'
import { joinConference, muteAllUsersConference } from '../../lib/phone/call'
import { CustomThemedTooltip } from '../CustomThemedTooltip'

export const WaitingConferenceView: FC<WaitingConferenceViewProps> = () => {
  const { isOwnerInside, isConferenceMuted, conferenceStartTime, conferenceId, ownerInformations } =
    useSelector((state: RootState) => state.conference)
  const { view, sideViewIsVisible } = useSelector((state: RootState) => state.island)
  const { t } = useTranslation()
  const dispatch = useDispatch<Dispatch>()

  const handleMuteParticipant = () => {
    if (conferenceId) {
      muteAllUsersConference(conferenceId, isConferenceMuted)
      dispatch.conference.toggleIsConferenceMuted(!isConferenceMuted)
    }
  }

  const openAddUserListToAddConference = () => {
    // Update island store and set conference list view to true
    dispatch.island.toggleConferenceList(true)
    // Set the island view to transfer list
    dispatch.island.setIslandView(view !== 'transfer' ? 'transfer' : 'call')
    // Check if sideView is visible and close it
    if (sideViewIsVisible) {
      eventDispatch('phone-island-sideview-close', {})
    }
    eventDispatch('phone-island-call-conference-list-opened', {})
  }

  const joinOwnerToConference = () => {
    dispatch.conference.toggleIsOwnerInside(true)
    joinConference()
  }

  return (
    <>
      <div className='pi-flex pi-flex-col pi-w-full'>
        {/* Header */}
        <div className='pi-flex pi-items-center pi-justify-between pi-text-gray-900 dark:pi-text-gray-50'>
          <h1 className='pi-text-lg pi-font-medium pi-leading-7 pi-w-full'>
            {isOwnerInside
              ? t('Conference.Conference')
              : t('Conference.Waiting for the conference')}
          </h1>
          {isOwnerInside && (
            <Timer
              size='small'
              startTime={String(Math?.floor(conferenceStartTime / 1000))}
              isNotAlwaysWhite
              isInsideConference
            />
          )}
        </div>

        {/* User waiting list */}
        <ConferenceUsersList />
        <div className='pi-flex pi-justify-center pi-space-x-6 pi-mt-6'>
          {!isOwnerInside ? (
            <>
              <Button variant='default' className='pi-w-52' onClick={() => joinOwnerToConference()}>
                <FontAwesomeIcon icon={faArrowRightToBracket} className='pi-mr-3' />
                {t('Conference.Start conference')}
              </Button>
              <Button
                variant='default'
                onClick={() => openAddUserListToAddConference()}
                data-tooltip-id='tooltip-add-user-to-conference-before-started'
                data-tooltip-content={t('Conference.Add participant') || ''}
              >
                <FontAwesomeIcon icon={faUserPlus} />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='default'
                active={isConferenceMuted ? true : false}
                onClick={() => handleMuteParticipant()}
                data-tooltip-id='tooltip-all-user-muted'
                data-tooltip-content={
                  isConferenceMuted
                    ? `${t('Conference.Unmute all participants')}`
                    : `${t('Conference.Mute all participants')}`
                }
              >
                {isConferenceMuted ? (
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faMicrophoneSlash} />
                ) : (
                  <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faMicrophone} />
                )}
              </Button>
              <Button
                data-stop-propagation={true}
                variant='default'
                onClick={() => openAddUserListToAddConference()}
                data-tooltip-id='tooltip-add-user-to-conference'
                data-tooltip-content={t('Conference.Add participant') || ''}
              >
                <FontAwesomeIcon icon={faUserPlus} className='pi-h-6 pi-w-6' />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={`pi-absolute pi-bottom-0 pi-right-0 pi-w-full pi-pb-2`}>
        <Hangup buttonsVariant='default' />
      </div>
      <CustomThemedTooltip className='pi-z-1000' id='tooltip-add-user-to-conference' place='top' />
      <CustomThemedTooltip
        className='pi-z-1000'
        id='tooltip-add-user-to-conference-before-started'
        place='left'
      />
      <CustomThemedTooltip className='pi-z-1000' id='tooltip-all-user-muted' place='top' />
    </>
  )
}

export interface WaitingConferenceViewProps {}
