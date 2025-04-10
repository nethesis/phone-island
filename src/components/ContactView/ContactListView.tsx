// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useState, FormEvent, useRef } from 'react'
import { Button } from '../Button'
import { RootState } from '../../store'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { backToPreviousView } from '../../lib/island/island'
import ListAvatar from './ListAvatar'
import {
  faPhone,
  faArrowLeft,
  faUser,
  faBuilding,
  faAngleRight,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons'
import { UserEndpointsTypes } from '../../types'
import {
  clickTransferOrConference,
  handleAttendedTransfer,
  isInsideConferenceList,
} from '../../lib/phone/call'
import { Dispatch } from '../../store'
import { unpauseCurrentCall } from '../../lib/phone/call'
import { useTranslation } from 'react-i18next'
import { useEventListener, eventDispatch } from '../../utils'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { getMainPhoneNumber, getTotalPhoneNumbers, searchPhonebook } from '../../services/phonebook'
import { PhonebookContact } from '../../types/phonebook'
import { SelectContactNumberView } from './SelectContactNumberView'
import debounce from 'lodash/debounce'

const USERS_NUMBER_PER_PAGE = 10
const SHOW_LIST_GRADIENT_DISTANCE = 3

type ContactResult = UserEndpointsTypes | PhonebookContact

export const ContactListView: FC<ContactListViewProps> = () => {
  const { isOpen, contactListView } = useSelector((state: RootState) => state.island)
  const { endpoints } = useSelector((state: RootState) => state.users)
  const { username } = useSelector((state: RootState) => state.currentUser)
  const [loaded, setLoaded] = useState<boolean>(false)
  const [contactResults, setContactResults] = useState<ContactResult[]>([])
  const [currentContact, setCurrentContact] = useState<PhonebookContact>()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCustomUser, setShowCustomUser] = useState<boolean>()
  const relativeRef = useRef<HTMLDivElement>(null)
  const [showGradient, setShowGradient] = useState<boolean>(false)
  const [showingUsers, setShowingUsers] = useState<number>(USERS_NUMBER_PER_PAGE)
  const dispatch = useDispatch<Dispatch>()

  // debounce phonebook search
  const debouncedFilterContacts = useRef(
    debounce((value: string) => {
      retrieveContacts(value)
    }, 300), // debounce delay
  ).current

  // cleanup the debounce function on unmount
  useEffect(() => {
    return () => {
      debouncedFilterContacts.cancel()
    }
  }, [debouncedFilterContacts])

  function searchQueryChanged(event: FormEvent<HTMLInputElement>) {
    setSearchQuery(event.currentTarget.value)
    debouncedFilterContacts(event.currentTarget.value)
  }

  async function retrieveContacts(textQuery: string = '') {
    setLoaded(false)
    textQuery = textQuery.trim().toLowerCase()
    let contactResults: ContactResult[] = []

    // filter operators

    if (endpoints) {
      // Remove the currentUser from the list
      username && delete endpoints[username]
      const operators = Object.values(endpoints).filter(
        (userEndpoints: UserEndpointsTypes) =>
          userEndpoints.endpoints.extension.find((extension) =>
            extension.id.toLowerCase().startsWith(textQuery),
          ) ||
          userEndpoints.username.toLowerCase().startsWith(textQuery) ||
          userEndpoints.name.toLowerCase().startsWith(textQuery) ||
          userEndpoints.name.toLowerCase().includes(textQuery) ||
          userEndpoints.username.toLowerCase() === textQuery,
      )
      contactResults = [...contactResults, ...operators]
    }

    // custom phone number

    if (/^[0-9*#+]+$/.test(textQuery)) {
      setShowCustomUser(true)
    } else {
      setShowCustomUser(false)
    }

    // search phonebook

    try {
      const phonebookSearchResult = await searchPhonebook(1, textQuery, '')
      // setPhonebookResult(phonebookSearchResult) //// uncomment?

      console.log('phonebookSearchResult', phonebookSearchResult) ////

      // filter contacts with at least one phone number
      contactResults = [...contactResults, ...phonebookSearchResult.rows]
    } catch (error) {
      console.error('Error fetching phonebook:', error)
    }
    setContactResults(contactResults)

    console.log('contactResults', contactResults) ////

    setLoaded(true)
  }

  useEventListener('phone-island-call-transfer', (data: CallStartTypes) => {
    handleAttendedTransfer(data.number, dispatch)
    eventDispatch('phone-island-call-transfer-opened', {})
  })

  // Initialize users list
  useEffect(() => {
    if (endpoints && username) {
      retrieveContacts()
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

  function isUserEndpointsType(obj: any): obj is UserEndpointsTypes {
    return obj && typeof obj === 'object' && 'endpoints' in obj && 'username' in obj
  }

  function isPhonebookContact(obj: any): obj is PhonebookContact {
    return obj && typeof obj === 'object' && 'source' in obj && 'name' in obj
  }

  function goToSelectNumberView(phonebookContact: PhonebookContact): void {
    setCurrentContact(phonebookContact)
    dispatch.island.setContactListView('selectContactNumber')
  }

  const { t } = useTranslation()

  const mainView = (
    <div className='pi-relative pi-flex pi-flex-col'>
      {/* Top section */}
      <div className='pi-relative pi-z-50'>
        <div className='pi-flex pi-gap-4'>
          <Button
            variant='transparent'
            onClick={handleBackClick}
            data-tooltip-id='contact-list-tooltip-back-to-call'
            data-tooltip-content={t('Tooltip.Back to call') || ''}
          >
            <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faArrowLeft} />
          </Button>
          <input
            data-stop-propagation={true}
            type='text'
            onChange={searchQueryChanged}
            value={searchQuery}
            placeholder={t('Common.Search contact or phone number') || ''}
            autoFocus
            spellCheck={false}
            className='pi-w-full pi-rounded-full dark:pi-bg-gray-950 pi-bg-gray-50 pi-border-2 pi-border-emerald-500 dark:pi-border-emerald-200 active:pi-border-emerald-500 dark:active:pi-border-emerald-200 focus:pi-border-emerald-500 dark:focus:pi-border-emerald-200 pi-text-gray-700 dark:pi-text-white pi-font-light pi-text-base pi-px-5 focus:pi-outline-0 focus:pi-ring-0 pi-placeholder-gray-800 dark:pi-placeholder-gray-200 pi-placeholder-text-xs'
          />
        </div>
      </div>
      {!loaded && (
        <FontAwesomeIcon icon={faCircleNotch} className='pi-mt-8 pi-animate-spin' size='4x' />
      )}
      <div className={!loaded ? 'pi-hidden' : ''}>
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
            {showCustomUser && (
              <div className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1'>
                <div className='pi-flex pi-items-center pi-gap-4'>
                  <ListAvatar />
                  <div
                    style={{ maxWidth: '146px' }}
                    className='pi-h-fit pi-max-w-40  pi-truncate pi-text-sm pi-font-medium'
                  >
                    {searchQuery}
                  </div>
                </div>
                <div className='pi-flex pi-gap-3.5'>
                  <Button
                    onClick={() => clickTransferOrConference(searchQuery, dispatch)}
                    variant='default'
                    data-tooltip-id='contact-list-tooltip-call-to-transfer'
                    data-tooltip-content={t('Tooltip.Click to transfer') || ''}
                  >
                    <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPhone} />
                  </Button>
                </div>
              </div>
            )}
            {/* Operators and phonebook contacts list */}
            {contactResults &&
              contactResults.slice(0, showingUsers).map((contactResult, i) => (
                <div
                  key={i}
                  className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1'
                >
                  <div className='pi-flex pi-items-center pi-gap-4'>
                    {(() => {
                      if (isUserEndpointsType(contactResult)) {
                        const isOnline = contactResult?.mainPresence === 'online'
                        const tooltipContent = isOnline
                          ? isInsideConferenceList()
                            ? t('Conference.Call to add')
                            : t('Tooltip.Click to transfer')
                          : ''

                        const handleClick = () => {
                          isOnline &&
                            clickTransferOrConference(
                              contactResult?.endpoints?.mainextension[0]?.id,
                              dispatch,
                            )
                        }

                        return (
                          <>
                            <ListAvatar
                              onClick={handleClick}
                              username={contactResult?.username}
                              status={contactResult?.mainPresence}
                              data-tooltip-id={isOnline ? 'contact-list-tooltip-right' : ''}
                              data-tooltip-content={tooltipContent}
                            />
                            <div>
                              <div
                                onClick={handleClick}
                                style={{ maxWidth: '196px' }}
                                data-stop-propagation={true}
                                data-tooltip-id={isOnline ? 'contact-list-tooltip-top' : ''}
                                data-tooltip-content={
                                  isOnline ? t('Tooltip.Click to transfer') : ''
                                }
                                className={`pi-h-fit pi-truncate pi-text-sm pi-font-medium pi-text-gray-600 dark:pi-text-white pi-transition ${
                                  isOnline ? 'pi-cursor-pointer' : ''
                                }`}
                              >
                                {contactResult.name}
                              </div>
                              <div className='pi-text-sm pi-text-gray-700 dark:pi-text-gray-300'>
                                {contactResult?.endpoints?.mainextension[0]?.id}
                              </div>
                            </div>
                          </>
                        )
                      } else if (isPhonebookContact(contactResult)) {
                        return (
                          <>
                            <div className='pi-relative pi-block pi-shrink-0 pi-h-12 pi-w-12 pi-text-base pi-bg-gray-700 dark:pi-bg-gray-200 pi-rounded-full'>
                              <div className='pi-text-white dark:pi-text-gray-950 pi-w-full pi-h-full pi-fill-white pi-flex pi-justify-center pi-items-center'>
                                <FontAwesomeIcon
                                  icon={contactResult.kind === 'person' ? faUser : faBuilding}
                                  className='pi-h-6 pi-w-6'
                                  aria-hidden='true'
                                />
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ maxWidth: '196px' }}
                                data-stop-propagation={true}
                                className='pi-h-fit pi-truncate pi-text-sm pi-font-medium pi-text-gray-600 dark:pi-text-white pi-transition'
                              >
                                {contactResult.displayName || '-'}
                              </div>
                              <div className='pi-text-sm pi-text-gray-700 dark:pi-text-gray-300'>
                                <span>{getMainPhoneNumber(contactResult) || '-'}</span>
                                {getTotalPhoneNumbers(contactResult) > 1 && (
                                  <span className='pi-ml-2'>
                                    {t('Common.plus_x_others', {
                                      count: getTotalPhoneNumbers(contactResult) - 1,
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
                        )
                      }
                    })()}
                  </div>
                  <div className='pi-flex pi-gap-3.5'>
                    {(() => {
                      if (isUserEndpointsType(contactResult)) {
                        return (
                          <Button
                            onClick={() =>
                              contactResult.mainPresence === 'online' &&
                              clickTransferOrConference(
                                contactResult?.endpoints?.mainextension[0]?.id,
                                dispatch,
                              )
                            }
                            variant='green'
                            disabled={contactResult.mainPresence !== 'online'}
                            data-tooltip-id={
                              contactResult.mainPresence === 'online'
                                ? 'contact-list-tooltip-left'
                                : ''
                            }
                            data-tooltip-content={t('Tooltip.Click to transfer') || ''}
                          >
                            <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPhone} />
                          </Button>
                        )
                      } else if (isPhonebookContact(contactResult)) {
                        if (getTotalPhoneNumbers(contactResult) < 2) {
                          return (
                            <Button
                              onClick={() =>
                                clickTransferOrConference(
                                  getMainPhoneNumber(contactResult),
                                  dispatch,
                                )
                              }
                              variant='green'
                              disabled={getTotalPhoneNumbers(contactResult) == 0}
                              data-tooltip-id={
                                getTotalPhoneNumbers(contactResult) > 0
                                  ? 'contact-list-tooltip-left'
                                  : ''
                              }
                              data-tooltip-content={t('Tooltip.Click to transfer') || ''}
                            >
                              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPhone} />
                            </Button>
                          )
                        } else {
                          // change view to show contact numbers
                          return (
                            <Button
                              onClick={() => goToSelectNumberView(contactResult)}
                              variant='transparent'
                              data-tooltip-id={'contact-list-tooltip-left'}
                              data-tooltip-content={t('Tooltip.Select phone number')}
                            >
                              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faAngleRight} />
                            </Button>
                          )
                        }
                      }
                    })()}
                  </div>
                </div>
              ))}
            {contactResults.length === 0 && !showCustomUser && (
              <p className=' pi-font-medium pi-w-full pi-flex pi-justify-center pi-text-sm'>
                {t('No contacts found')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {(() => {
        switch (contactListView) {
          case 'main':
            return mainView
          case 'selectContactNumber':
            return <SelectContactNumberView contact={currentContact} />
          default:
            return mainView
        }
      })()}
      <CustomThemedTooltip className='pi-z-1000' id='contact-list-tooltip-left' place='left' />
      <CustomThemedTooltip
        className='pi-z-1000'
        id='contact-list-tooltip-back-to-call'
        place='right'
      />
      <CustomThemedTooltip
        className='pi-z-1000'
        id='contact-list-tooltip-call-to-transfer'
        place='left'
      />
      <CustomThemedTooltip className='pi-z-1000' id='contact-list-tooltip-top' place='top' />
      <CustomThemedTooltip className='pi-z-1000' id='contact-list-tooltip-right' place='right' />
    </>
  )
}

interface ContactListViewProps {}

interface CallStartTypes {
  number: string
}
