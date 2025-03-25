// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useState, FormEvent, useRef } from 'react'
import { Button } from '../Button'
import { RootState } from '../../store'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { backToPreviousView } from '../../lib/island/island'
import ListAvatar from './ListAvatar'
import { faPhone, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { UserEndpointsTypes, UsersEndpointsTypes } from '../../types'
import { attendedTransfer, hangupCurrentCall, startConference } from '../../lib/phone/call'
import { Dispatch } from '../../store'
import { unpauseCurrentCall } from '../../lib/phone/call'
import { useTranslation } from 'react-i18next'
import { useEventListener, eventDispatch } from '../../utils'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { store } from '../../store'

const USERS_NUMBER_PER_PAGE = 10
const SHOW_LIST_GRADIENT_DISTANCE = 3

export const TransferListView: FC<TransferListViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { endpoints } = useSelector((state: RootState) => state.users)
  const { username } = useSelector((state: RootState) => state.currentUser)

  const [loaded, setLoaded] = useState<boolean>(false)
  const [listUsers, setListUsers] = useState<UserEndpointsTypes[]>([])
  const searchValue = useRef<string>('')
  const [showCustomUser, setShowCustomUser] = useState<boolean>()
  const relativeRef = useRef<HTMLDivElement>(null)
  const [showGradient, setShowGradient] = useState<boolean>(false)
  const [showingUsers, setShowingUsers] = useState<number>(USERS_NUMBER_PER_PAGE)
  const dispatch = useDispatch<Dispatch>()

  function handleChange(event: FormEvent<HTMLInputElement>) {
    // Update search value
    searchValue.current = event.currentTarget.value
    // Filter the users list
    endpoints && setListUsers(filterUsers(endpoints))
    // Check if custom user to call must be visible
    if (/^[0-9*#+]+$/.test(searchValue.current)) {
      setShowCustomUser(true)
    } else {
      setShowCustomUser(false)
    }
  }

  function filterUsers(endpoints: UsersEndpointsTypes) {
    // Remove the currentUser from the list
    username && delete endpoints[username]
    // Filter the users
    return Object.values(endpoints).filter(
      (userEndpoints: UserEndpointsTypes) =>
        userEndpoints.endpoints.extension.find((extension) =>
          extension.id.toLowerCase().startsWith(searchValue.current.toLowerCase()),
        ) ||
        userEndpoints.username.toLowerCase().startsWith(searchValue.current.toLowerCase()) ||
        userEndpoints.name.toLowerCase().startsWith(searchValue.current.toLowerCase()) ||
        userEndpoints.name.toLowerCase().includes(searchValue.current.toLowerCase()) ||
        userEndpoints.username.toLowerCase() === searchValue.current.toLowerCase(),
    )
  }

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

      eventDispatch('phone-island-call-transfered', {})
    }
  }
  useEventListener('phone-island-call-transfer', (data: CallStartTypes) => {
    handleAttendedTransfer(data.number)
    eventDispatch('phone-island-call-transfer-opened', {})
  })

  // Initialize users list
  useEffect(() => {
    if (endpoints && username) {
      setListUsers(filterUsers(endpoints))
      setLoaded(true)
    }
  }, [endpoints, username])

  useEffect(() => {
    // Handle users list scrolling
    const handleScroll = () => {
      setShowGradient(
        relativeRef.current && relativeRef.current.scrollTop > SHOW_LIST_GRADIENT_DISTANCE
          ? true
          : false,
      )
      // Manage scroll to bottom
      if (
        relativeRef.current &&
        relativeRef.current?.offsetHeight + relativeRef.current?.scrollTop >=
          relativeRef.current?.scrollHeight - 10
      ) {
        // Improve showing users
        setShowingUsers((state) => state + USERS_NUMBER_PER_PAGE)
      }
    }
    // Manage expansion and collapsing
    if (isOpen) {
      relativeRef.current?.addEventListener('scroll', handleScroll)
    } else {
      relativeRef.current?.removeEventListener('scroll', handleScroll)
    }
    return () => relativeRef.current?.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  function handleBackClick() {
    if (isInsideConferenceList()) {
      // Close the conference list
      eventDispatch('phone-island-conference-list-close', {})
    } else {
      // Unpause the current call
      unpauseCurrentCall()
    }

    // Open the call view
    backToPreviousView()
  }

  const waitingConferenceView = (numberToCall) => {
    const { username }: any = store.getState().currentUser
    const { isActive, isOwnerInside } = store.getState().conference
    // show current waiting user in back view ( only on first)
    if (!isActive) {
      dispatch.conference.setConferenceActive(true)
      dispatch.conference.setConferenceStartedFrom(username)
    }
    // start new call with selected user from conference list
    if (isOwnerInside) {
      // if owner has already started the conference hangup before make a new call
      hangupCurrentCall()
      setTimeout(() => {
        eventDispatch('phone-island-call-start', { number: numberToCall })
      }, 500)
    } else {
      eventDispatch('phone-island-call-start', { number: numberToCall })
    }
  }

  const clickTransferOrConference = async (number: string) => {
    if (isInsideConferenceList()) {
      const { isActive } = store.getState().conference
      console.log('isActive', isActive)
      // Put current call user inside conference mode (only for first user to add not for the second one)
      if (!isActive) {
        const conferenceStarted = await startConference()
        if (conferenceStarted) {
          waitingConferenceView(number)
        }
      } else {
        waitingConferenceView(number)
      }
    } else {
      handleAttendedTransfer(number)
    }
  }

  const isInsideConferenceList = () => {
    const { isConferenceList } = store.getState().island
    if (isConferenceList) {
      return true
    }
    return false
  }
  const { t } = useTranslation()

  return (
    <>
      {isOpen ? (
        <div className='pi-relative pi-flex pi-flex-col'>
          {/* Top section */}
          <div className='pi-relative pi-z-50'>
            <div className='pi-flex pi-gap-4'>
              <Button
                variant='transparent'
                onClick={handleBackClick}
                data-tooltip-id='transfer-list-tooltip-back-to-call'
                data-tooltip-content={t('Tooltip.Back to call') || ''}
              >
                <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faArrowLeft} />
              </Button>
              <input
                data-stop-propagation={true}
                type='text'
                onChange={handleChange}
                value={searchValue?.current}
                placeholder={t('Common.Search or type a contact') || ''}
                autoFocus
                spellCheck={false}
                className='pi-w-full pi-rounded-full dark:pi-bg-gray-950 pi-bg-gray-50 pi-border-2 pi-border-emerald-500 dark:pi-border-emerald-200 active:pi-border-emerald-500 dark:active:pi-border-emerald-200 focus:pi-border-emerald-500 dark:focus:pi-border-emerald-200 pi-text-gray-700 dark:pi-text-white pi-font-light pi-text-xl pi-text-center pi-px-2 focus:pi-outline-0 focus:pi-ring-0 pi-placeholder-gray-800 dark:pi-placeholder-gray-200 pi-placeholder-text-xs'
              />
            </div>
          </div>
          {/* List shadow */}
          <div className='pi-z-30 pi-h-6 pi-pointer-events-none pi-bg-transparent pi-mt-7 pi-pr-4'>
            {showGradient && (
              <div className='pi-h-6 pi-w-full pi-bg-gradient-to-b dark:pi-from-black pi-from-gray-100 pi-to-transparent pi-z-100'></div>
            )}
          </div>
          <div style={{ marginTop: '-22px' }} className='pi-flex pi-flex-col pi-gap-7'>
            {/* List section */}
            <div
              style={{ height: '17rem' }}
              ref={relativeRef}
              className='pi-relative pi-w-full pi-flex pi-flex-col pi-gap-1 pi-overflow-y-auto pi-overflow-x-hidden pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'
            >
              {/* The custom searched number */}
              {showCustomUser && listUsers.length === 0 && (
                <div className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1'>
                  <div className='pi-flex pi-items-center pi-gap-4'>
                    <ListAvatar />
                    <div
                      style={{ maxWidth: '146px' }}
                      className='pi-h-fit pi-max-w-40  pi-truncate pi-text-sm pi-font-bold'
                    >
                      {searchValue.current}
                    </div>
                  </div>
                  <div className='pi-flex pi-gap-3.5'>
                    <Button
                      onClick={() => clickTransferOrConference(searchValue?.current)}
                      variant='default'
                      data-tooltip-id='transfer-list-tooltip-call-to-transfer'
                      data-tooltip-content={t('Tooltip.Call to transfer') || ''}
                    >
                      <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPhone} />
                    </Button>
                  </div>
                </div>
              )}
              {/* The users list */}
              {listUsers &&
                listUsers.slice(0, showingUsers).map((userEndpoints, i) => (
                  <div
                    key={i}
                    className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1'
                  >
                    <div className='pi-flex pi-items-center pi-gap-4'>
                      {(() => {
                        const isOnline = userEndpoints?.mainPresence === 'online'
                        const tooltipContent = isOnline
                          ? isInsideConferenceList()
                            ? t('Conference.Call to add')
                            : t('Tooltip.Call to transfer')
                          : ''

                        const handleClick = () => {
                          isOnline &&
                            clickTransferOrConference(
                              userEndpoints?.endpoints?.mainextension[0]?.id,
                            )
                        }

                        return (
                          <>
                            <ListAvatar
                              onClick={handleClick}
                              username={userEndpoints?.username}
                              status={userEndpoints?.mainPresence}
                              data-tooltip-id={isOnline ? 'transfer-list-tooltip-right' : ''}
                              data-tooltip-content={tooltipContent}
                            />
                            <div
                              onClick={handleClick}
                              style={{ maxWidth: '196px' }}
                              data-stop-propagation={true}
                              data-tooltip-id={isOnline ? 'transfer-list-tooltip-top' : ''}
                              data-tooltip-content={isOnline ? t('Tooltip.Call to transfer') : ''}
                              className='pi-h-fit pi-truncate pi-text-sm pi-font-bold pi-text-gray-600 dark:pi-text-white pi-transition'
                            >
                              {userEndpoints.name}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <div className='pi-flex pi-gap-3.5'>
                      {userEndpoints.mainPresence === 'online' && (
                        <Button
                          onClick={() =>
                            userEndpoints.mainPresence === 'online' &&
                            clickTransferOrConference(
                              userEndpoints?.endpoints?.mainextension[0]?.id,
                            )
                          }
                          variant='green'
                          disabled={userEndpoints.mainPresence !== 'online'}
                          data-tooltip-id='transfer-list-tooltip-left'
                          data-tooltip-content={t('Tooltip.Call to transfer') || ''}
                        >
                          <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPhone} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              {loaded && listUsers.length === 0 && !showCustomUser && (
                <p className=' pi-font-bold pi-w-full pi-flex pi-justify-center pi-text-sm'>
                  {t('No users found')}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='pi-font-medium pi-text-base '>Transfer</div>
      )}
      <CustomThemedTooltip className='pi-z-1000' id='transfer-list-tooltip-left' place='left' />
      <CustomThemedTooltip
        className='pi-z-1000'
        id='transfer-list-tooltip-back-to-call'
        place='right'
      />
      <CustomThemedTooltip
        className='pi-z-1000'
        id='transfer-list-tooltip-call-to-transfer'
        place='left'
      />
      <CustomThemedTooltip className='pi-z-1000' id='transfer-list-tooltip-top' place='top' />
      <CustomThemedTooltip className='pi-z-1000' id='transfer-list-tooltip-right' place='right' />
    </>
  )
}

interface TransferListViewProps {}

interface CallStartTypes {
  number: string
}
