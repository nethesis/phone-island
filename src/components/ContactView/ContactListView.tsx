// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useState, FormEvent, useRef, useMemo } from 'react'
import { Button } from '../Button'
import { RootState } from '../../store'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { backToPreviousView } from '../../lib/island/island'
import {
  faPhone,
  faArrowLeft,
  faUser,
  faBuilding,
  faAngleRight,
  faHeadset,
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
import ListAvatar from './ListAvatar'

const USERS_NUMBER_PER_PAGE = 10
const SHOW_LIST_GRADIENT_DISTANCE = 3

export const ContactListView: FC<ContactListViewProps> = () => {
  const { isOpen, contactListView } = useSelector((state: RootState) => state.island)
  const { endpoints } = useSelector((state: RootState) => state.users)
  const { username } = useSelector((state: RootState) => state.currentUser)
  const [loaded, setLoaded] = useState<boolean>(false)
  const [filteredOperators, setFilteredOperators] = useState<UserEndpointsTypes[]>([])
  const [filteredPhonebookContacts, setFilteredPhonebookContacts] = useState<PhonebookContact[]>([])
  const [currentContact, setCurrentContact] = useState<PhonebookContact>()
  const [firstPhonebookLoading, setFirstPhonebookLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPhoneNumberTyped, setShowPhoneNumberTyped] = useState<boolean>()
  const relativeRef = useRef<HTMLDivElement>(null)
  const [showGradient, setShowGradient] = useState<boolean>(false)
  const [showingUsers, setShowingUsers] = useState<number>(USERS_NUMBER_PER_PAGE)
  const dispatch = useDispatch<Dispatch>()

  const filteredContacts = useMemo(() => {
    return [...filteredOperators, ...filteredPhonebookContacts]
  }, [filteredOperators, filteredPhonebookContacts])

  // debounce phonebook search
  const debouncedSearchPhonebookContacts = useRef(
    debounce((value: string) => {
      retrievePhonebookContacts(value)
    }, 300), // debounce delay
  ).current

  // cleanup the debounce function on unmount
  useEffect(() => {
    return () => {
      debouncedSearchPhonebookContacts.cancel()
    }
  }, [debouncedSearchPhonebookContacts])

  function searchQueryChanged(event: FormEvent<HTMLInputElement>) {
    setSearchQuery(event.currentTarget.value)
    debouncedSearchPhonebookContacts(event.currentTarget.value)
    filterOperators(event.currentTarget.value)
  }

  function retrieveContacts() {
    filterOperators(searchQuery)

    // load phonebook contacts only once

    if (firstPhonebookLoading) {
      retrievePhonebookContacts(searchQuery)
      setFirstPhonebookLoading(false)
    }
  }

  function filterOperators(textQuery: string = '') {
    textQuery = textQuery.trim().toLowerCase()

    if (endpoints) {
      const operators = Object.values(endpoints).filter(
        (userEndpoints: UserEndpointsTypes) =>
          // Remove the currentUser from the list
          userEndpoints.username !== username &&
          (userEndpoints.endpoints.extension.find((extension) =>
            extension.id.toLowerCase().startsWith(textQuery),
          ) ||
            userEndpoints.username.toLowerCase().includes(textQuery) ||
            userEndpoints.name.toLowerCase().includes(textQuery)),
      )
      setFilteredOperators(operators)
    }
  }

  async function retrievePhonebookContacts(textQuery: string = '') {
    setLoaded(false)
    textQuery = textQuery.trim().toLowerCase()

    // phone number typed

    if (/^[0-9*#+]+$/.test(textQuery)) {
      setShowPhoneNumberTyped(true)
    } else {
      setShowPhoneNumberTyped(false)
    }

    // search phonebook

    try {
      const phonebookSearchResult = await searchPhonebook(1, textQuery, '')
      setFilteredPhonebookContacts(phonebookSearchResult.rows)
    } catch (error) {
      console.error('Error fetching phonebook:', error)
    }
    setLoaded(true)
  }

  useEventListener('phone-island-call-transfer', (data: CallStartTypes) => {
    handleAttendedTransfer(data.number, dispatch)
    eventDispatch('phone-island-call-transfer-opened', {})
  })

  // Retrieve
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
            className='pi-w-full pi-rounded-full dark:pi-bg-gray-950 pi-bg-gray-50 pi-border-2 pi-border-emerald-500 dark:pi-border-emerald-200 active:pi-border-emerald-500 dark:active:pi-border-emerald-200 focus:pi-border-emerald-500 dark:focus:pi-border-emerald-200 pi-text-gray-900 dark:pi-text-gray-50 pi-font-light pi-text-sm pi-px-5 focus:pi-outline-0 focus:pi-ring-0 pi-placeholder-gray-400 dark:pi-placeholder-gray-500 pi-font-[inherit]'
          />
        </div>
      </div>
      {/* skeleton loader */}
      {!loaded && (
        <div className='pi-mt-6'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='pi-animate-pulse pi-flex pi-items-center pi-space-x-4 pi-px-3 pi-py-1'
            >
              <div className='pi-flex pi-items-center pi-justify-center'>
                <div className='pi-rounded-full pi-h-12 pi-w-12 pi-bg-gray-300 dark:pi-bg-gray-700'></div>
              </div>
              <div className='pi-flex pi-flex-col pi-gap-2 pi-w-full'>
                <div className='pi-h-3 pi-w-4/5 pi-rounded pi-bg-gray-300 dark:pi-bg-gray-700'></div>
                <div className='pi-h-3 pi-w-1/2 pi-rounded pi-bg-gray-300 dark:pi-bg-gray-700'></div>
              </div>
              <div className='pi-flex pi-items-center pi-justify-center pi-pr-2'>
                <div className='pi-rounded-full pi-h-12 pi-w-12 pi-bg-gray-300 dark:pi-bg-gray-700'></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* contact list */}
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
            {showPhoneNumberTyped && (
              <div className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1 pi-rounded-md hover:pi-bg-gray-200 hover:dark:pi-bg-gray-800'>
                <div className='pi-flex pi-items-center pi-gap-4'>
                  <ListAvatar placeHolderIcon={faUser} />
                  <div>
                    <div className='pi-h-fit pi-max-w-48 pi-truncate pi-text-sm pi-font-medium'>
                      {t('Common.Phone number entered')}
                    </div>
                    <div className='pi-text-sm pi-max-w-48 pi-text-gray-700 dark:pi-text-gray-300'>
                      {searchQuery}
                    </div>
                  </div>
                </div>
                <div className='pi-flex pi-gap-3.5'>
                  <Button
                    onClick={() => clickTransferOrConference(searchQuery, dispatch)}
                    variant='green'
                    data-tooltip-id='contact-list-tooltip-call-to-transfer'
                    data-tooltip-content={
                      isInsideConferenceList()
                        ? t('Conference.Add participant')
                        : t('Tooltip.Transfer call')
                    }
                  >
                    <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPhone} />
                  </Button>
                </div>
              </div>
            )}
            {/* Operators and phonebook contacts list */}
            {filteredContacts &&
              filteredContacts.slice(0, showingUsers).map((filteredContact, i) => (
                <div
                  key={i}
                  className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1 pi-rounded-md hover:pi-bg-gray-200 hover:dark:pi-bg-gray-800'
                >
                  <div className='pi-flex pi-items-center pi-gap-4'>
                    {(() => {
                      if (isUserEndpointsType(filteredContact)) {
                        return (
                          <>
                            <ListAvatar
                              username={filteredContact?.username}
                              status={filteredContact?.mainPresence}
                              placeHolderIcon={faHeadset}
                            />
                            <div>
                              <div
                                data-stop-propagation={true}
                                className={`pi-h-fit pi-max-w-48 pi-truncate pi-text-sm pi-font-medium`}
                              >
                                {filteredContact.name}
                              </div>
                              <div className='pi-text-sm pi-max-w-48 pi-text-gray-700 dark:pi-text-gray-300'>
                                {filteredContact?.endpoints?.mainextension[0]?.id}
                              </div>
                            </div>
                          </>
                        )
                      } else if (isPhonebookContact(filteredContact)) {
                        return (
                          <>
                            <ListAvatar
                              placeHolderIcon={
                                filteredContact.kind === 'person' ? faUser : faBuilding
                              }
                            />
                            <div>
                              <div
                                data-stop-propagation={true}
                                className='pi-h-fit pi-max-w-48 pi-truncate pi-text-sm pi-font-medium'
                              >
                                {filteredContact.displayName || '-'}
                              </div>
                              <div className='pi-text-sm pi-max-w-48 pi-text-gray-700 dark:pi-text-gray-300'>
                                <span>{getMainPhoneNumber(filteredContact) || '-'}</span>
                                {getTotalPhoneNumbers(filteredContact) > 1 && (
                                  <span className='pi-ml-2'>
                                    {t('Common.plus_x_others', {
                                      count: getTotalPhoneNumbers(filteredContact) - 1,
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
                      if (isUserEndpointsType(filteredContact)) {
                        return (
                          <Button
                            onClick={() =>
                              filteredContact.mainPresence === 'online' &&
                              clickTransferOrConference(
                                filteredContact?.endpoints?.mainextension[0]?.id,
                                dispatch,
                              )
                            }
                            variant='green'
                            disabled={filteredContact.mainPresence !== 'online'}
                            data-tooltip-id={
                              filteredContact.mainPresence === 'online'
                                ? 'contact-list-tooltip-left'
                                : ''
                            }
                            data-tooltip-content={
                              isInsideConferenceList()
                                ? t('Conference.Add participant')
                                : t('Tooltip.Transfer call')
                            }
                          >
                            <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPhone} />
                          </Button>
                        )
                      } else if (isPhonebookContact(filteredContact)) {
                        if (getTotalPhoneNumbers(filteredContact) < 2) {
                          return (
                            <Button
                              onClick={() =>
                                clickTransferOrConference(
                                  getMainPhoneNumber(filteredContact),
                                  dispatch,
                                )
                              }
                              variant='green'
                              disabled={getTotalPhoneNumbers(filteredContact) == 0}
                              data-tooltip-id={
                                getTotalPhoneNumbers(filteredContact) > 0
                                  ? 'contact-list-tooltip-left'
                                  : ''
                              }
                              data-tooltip-content={
                                isInsideConferenceList()
                                  ? t('Conference.Add participant')
                                  : t('Tooltip.Transfer call')
                              }
                            >
                              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPhone} />
                            </Button>
                          )
                        } else {
                          // change view to show contact numbers
                          return (
                            <Button
                              onClick={() => goToSelectNumberView(filteredContact)}
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
            {filteredContacts.length === 0 && !showPhoneNumberTyped && (
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
    </>
  )
}

interface ContactListViewProps {}

interface CallStartTypes {
  number: string
}
