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

const KeypadView: FC<KeypadViewTypes> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { keypadValue } = useSelector((state: RootState) => state.currentCall)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const keypadValueRef = useRef<typeof keypadValue>(keypadValue)

  function backToCallView() {
    dispatch.island.setIslandView('call')
  }

  function playDtmfAudio(key: string) {
    if (key === '*') key = 'star'
    if (key === '#') key = 'pound'
    dispatch.player.updateAndPlayAudioPlayer({ src: dtmfAudios[`dtmf_${key}`] })
  }

  function sendKey(key: string) {
    dispatch.currentCall.updateKeypadValue(`${keypadValueRef.current}${key}`)
    keypadValueRef.current = `${keypadValueRef.current}${key}`
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
    <>
      {isOpen ? (
        <div className='pi-flex pi-flex-col pi-gap-7'>
          <div className='pi-flex pi-gap-4'>
            <Button variant='transparent' onClick={backToCallView}>
              <FontAwesomeIcon size='xl' icon={faArrowLeft} />
            </Button>
            <input
              type='text'
              readOnly
              value={keypadValue}
              autoFocus
              className='pi-w-full pi-rounded-2xl pi-bg-black pi-border-2 pi-border-emerald-500 active:pi-border-emerald-500 focus:pi-border-emerald-500 pi-text-white pi-font-sans pi-font-light pi-text-xl pi-text-center pi-px-2 focus:pi-outline-0'
            />
          </div>
          <Actions keyCallback={sendKey} />
          <div className='pi-flex pi-justify-center'>
            {/* The button to hangup the currentCall */}
            <Button onClick={hangupCurrentCall} variant='red'>
              <FontAwesomeIcon className='pi-rotate-135 pi-w-6 pi-h-6' icon={faPhone} />
            </Button>
          </div>
        </div>
      ) : (
        <div className='pi-font-medium pi-text-base'>Keypad</div>
      )}
    </>
  )
}

export default KeypadView

export interface KeypadViewTypes {}
