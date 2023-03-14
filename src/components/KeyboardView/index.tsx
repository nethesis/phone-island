// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef } from 'react'
import { Button } from '../Button'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { faArrowLeft } from '@nethesis/nethesis-light-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Actions from './Actions'
import { hangupCurrentCall } from '../../lib/phone/call'
import { faPhone } from '@nethesis/nethesis-solid-svg-icons'
import dtmfAudios from '../../static/dtmf'
import { sendDTMF } from '../../lib/webrtc/messages'

const DTMF_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#']

const KeyboardView: FC<KeyboardViewTypes> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { keyboardValue } = useSelector((state: RootState) => state.currentCall)
  const keyboardValueRef = useRef<typeof keyboardValue>(keyboardValue)

  function backToCallView() {
    dispatch.island.setIslandView('call')
  }

  function playDtmfAudio(key: string) {
    if (key === '*') key = 'star'
    if (key === '#') key = 'pound'
    dispatch.player.updateAndPlayAudioPlayer({ src: dtmfAudios[`dtmf_${key}`] })
  }

  function sendKey(key: string) {
    dispatch.currentCall.updateKeyboardValue(`${keyboardValueRef.current}${key}`)
    keyboardValueRef.current = `${keyboardValueRef.current}${key}`
    playDtmfAudio(key)
    sendDTMF(key)
  }

  useEffect(() => {
    function handlePhysicalKeydown(event) {
      if (DTMF_KEYS.includes(event.key)) {
        sendKey(event.key)
      }
    }
    window.addEventListener('keydown', handlePhysicalKeydown)
    return () => window.removeEventListener('keydown', handlePhysicalKeydown)
  }, [])

  return (
    <div className='flex flex-col gap-7'>
      <div className='flex gap-4'>
        <Button variant='transparent' onClick={backToCallView}>
          <FontAwesomeIcon size='xl' icon={faArrowLeft} />
        </Button>
        <input
          type='text'
          readOnly
          value={keyboardValue}
          autoFocus
          className='w-full rounded-xl bg-black border border-gray-300 text-white font-sans font-light text-xl text-center px-2'
        />
      </div>
      <Actions keyCallback={sendKey} />
      <div className='flex justify-center'>
        {/* The button to hangup the currentCall */}
        <Button onClick={hangupCurrentCall} variant='red'>
          <FontAwesomeIcon className='rotate-135 w-6 h-6' icon={faPhone} />
        </Button>
      </div>
    </div>
  )
}

export default KeyboardView

export interface KeyboardViewTypes {}
