// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useState, FormEvent, useRef } from 'react'
import { Button } from '../Button'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone } from '@nethesis/nethesis-solid-svg-icons'
import { hangupCurrentCall } from '../../lib/phone/call'
import { backToCallView } from '../../lib/island/island'
import ListAvatar from './ListAvatar'
import {
  faArrowRightLongToLine,
  faPhone as faPhoneLight,
  faArrowLeft,
} from '@nethesis/nethesis-light-svg-icons'
import { UserEndpointsTypes, UsersEndpointsTypes } from '../../types'
import { blindTransfer, attendedTransfer } from '../../lib/phone/call'
import { motion } from 'framer-motion/dist/cjs'

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

  useEffect(() => {
    if (endpoints && username) {
      setListUsers(filterUsers(endpoints))
      setLoaded(true)
    }
  }, [endpoints, username])

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
        userEndpoints.name.toLowerCase().startsWith(searchValue.current.toLowerCase()),
    )
  }

  const relativeRef = useRef<HTMLDivElement>(null)
  const [showGradient, setShowGradient] = useState<boolean>(false)
  const [showingUsers, setShowingUsers] = useState<number>(USERS_NUMBER_PER_PAGE)
  const [userForBlindTransfer, setUserForBlindTransfer] = useState<string>('')

  useEffect(() => {
    // Handle users list scrolling
    const handleScroll = () => {
      setShowGradient(
        relativeRef.current && relativeRef.current.scrollTop > SHOW_LIST_GRADIENT_DISTANCE
          ? true
          : false,
      )
      // Manage scroll arrived to bottom
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

  // Reset user tto blind transfer value when search value changes
  useEffect(() => {
    setUserForBlindTransfer('')
  }, [searchValue.current])

  return (
    <>
      {isOpen ? (
        <div className='pi-relative pi-flex pi-flex-col pi-gap-7'>
          <div className='pi-flex pi-gap-4'>
            <Button variant='transparent' onClick={backToCallView}>
              <FontAwesomeIcon size='xl' icon={faArrowLeft} />
            </Button>
            <input
              data-stop-propagation={true}
              type='text'
              onChange={handleChange}
              value={searchValue.current}
              autoFocus
              className='pi-w-full pi-rounded-full pi-bg-black pi-border-2 pi-border-emerald-500 active:pi-border-emerald-500 focus:pi-border-emerald-500 pi-text-white pi-font-sans pi-font-light pi-text-xl pi-text-center pi-px-2 focus:pi-outline-0'
            />
          </div>
          <div
            style={{ height: '272px' }}
            ref={relativeRef}
            className='pi-relative pi-w-full pi-flex pi-flex-col pi-gap-2 pi-overflow-y-auto pi-overflow-x-hidden'
          >
            {showGradient && (
              <div
                style={{ right: '35px', left: '35px' }}
                className='pi-fixed pi-z-10 pi-h-6 pi-bg-gradient-to-b pi-from-black pi-to-transparent pi-pointer-events-none'
              ></div>
            )}
            {/* The custom user */}
            {showCustomUser && listUsers.length === 0 && (
              <div className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1'>
                <div className='pi-flex pi-items-center pi-gap-4'>
                  <ListAvatar />
                  <div
                    style={{ maxWidth: '146px' }}
                    className='pi-h-fit pi-max-w-40 pi-font-sans pi-truncate pi-text-sm pi-font-bold'
                  >
                    {searchValue.current}
                  </div>
                </div>
                <div className='pi-flex pi-gap-3.5'>
                  <Button variant='default'>
                    <FontAwesomeIcon size='xl' icon={faArrowRightLongToLine} />
                  </Button>
                  <Button onClick={() => blindTransfer(searchValue.current)} variant='default'>
                    <FontAwesomeIcon size='xl' icon={faPhoneLight} />
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
                    <ListAvatar
                      username={userEndpoints.username}
                      status={userEndpoints.mainPresence}
                    />
                    <div
                      style={{ maxWidth: '146px' }}
                      className='pi-h-fit pi-max-w-40 pi-font-sans pi-truncate pi-text-sm pi-font-bold'
                    >
                      {userEndpoints.name}
                    </div>
                  </div>
                  <div className='pi-flex pi-gap-3.5'>
                    <Button
                      active={userEndpoints.username === userForBlindTransfer}
                      onClick={() => setUserForBlindTransfer(userEndpoints.username)}
                      variant='default'
                    >
                      <FontAwesomeIcon size='xl' icon={faArrowRightLongToLine} />
                    </Button>
                    <Button
                      onClick={() => attendedTransfer(userEndpoints.endpoints.mainextension[0].id)}
                      variant='default'
                    >
                      <FontAwesomeIcon size='xl' icon={faPhoneLight} />
                    </Button>
                  </div>
                </div>
              ))}
            {loaded && listUsers.length === 0 && !showCustomUser && (
              <p className='pi-font-sans pi-font-bold pi-w-full pi-flex pi-justify-center pi-text-sm'>
                No users found.
              </p>
            )}
          </div>
          <div className='pi-flex pi-justify-center'>
            {/* The button to hangup the currentCall */}
            <motion.div animate={userForBlindTransfer ? { width: '360px' } : { width: '48px' }}>
              <Button
                onClick={() =>
                  userForBlindTransfer
                    ? blindTransfer(
                        (endpoints &&
                          endpoints[userForBlindTransfer].endpoints.mainextension[0].id) ||
                          '',
                      )
                    : hangupCurrentCall()
                }
                variant='red'
                className='pi-gap-4 pi-font-medium pi-text-base pi-transition pi-w-full'
              >
                <FontAwesomeIcon className='pi-rotate-135 pi-h-6 pi-w-6' icon={faPhone} />
                {userForBlindTransfer && (
                  <motion.div
                    style={{ height: '17px' }}
                    className='pi-whitespace-nowrap pi-overflow-hidden'
                  >
                    Hangup and transfer
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className='pi-font-medium pi-text-base pi-font-sans'>Transfer</div>
      )}
    </>
  )
}

interface TransferListViewProps {}
