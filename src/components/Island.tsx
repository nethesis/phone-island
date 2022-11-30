// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { answer } from '../lib/webrtc/messages'
import { hangup, decline } from '../lib/webrtc/messages'

interface IslandProps {
  always: boolean
}

export const Island = ({ always }: IslandProps) => {
  const { incoming, accepted } = useSelector((state: RootState) => state.currentCall)

  const DisplayName = () => {
    const { displayName } = useSelector((state: RootState) => state.currentCall)
    return <span>{displayName ? displayName : '-'}</span>
  }

  return (
    <>
      {(incoming || always) && ( // add calling
        <>
          <div className='bg-black px-10 py-8 rounded-3xl flex flex-col gap-5 text-white w-fit absolute bottom-6 left-20 font-sans'>
            <div className='flex items-center'>
              <DisplayName />
              {accepted && <span className='ml-5 w-3 h-3 bg-red-600 rounded-full animate-ping'></span>}{' '}
            </div>
            <div className='flex gap-3'>
              <button
                onClick={answer}
                className='flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 bg-green-600 text-white border border-transparent hover:bg-green-700 focus:ring-green-500 focus:ring-offset-black rounded-md px-3 py-2 text-sm leading-4'
              >
                Answer
              </button>
              <button
                onClick={accepted ? hangup : decline}
                className='flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 bg-red-600 text-white border border-transparent hover:bg-red-700 focus:ring-red-500 focus:ring-offset-black rounded-md px-3 py-2 text-sm leading-4'
              >
                Decline
              </button>
            </div>
          </div>
        </>
      )}
      <audio id='audio' className='hidden' autoPlay></audio>
      <video id='localVideo' className='hidden' autoPlay></video>
      <video id='remoteVideo' className='hidden' autoPlay></video>
    </>
  )
}
