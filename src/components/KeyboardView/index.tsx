// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState, FormEvent } from 'react'
import { Button } from '../Button'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { faArrowLeft } from '@nethesis/nethesis-light-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Actions from './Actions'
import { hangupCurrentCall } from '../../lib/phone/call'
import { faPhone } from '@nethesis/nethesis-solid-svg-icons'

const PHYSICAL_ALLOWED_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#']

const KeyboardView: FC<KeyboardViewTypes> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { keyboardValue } = useSelector((state: RootState) => state.currentCall)
  const [oldKeyboardValueLength, setOldKeyboardValueLength] = useState<number>(0)

  function backToCall() {
    dispatch.island.setIslandView('call')
  }

  function keyPressedCallback(value: string) {
    setOldKeyboardValueLength((state) => state + 1)
    dispatch.currentCall.updateKeyboardValue(`${keyboardValue}${value}`)
  }

  function handlePhysicalKeyboardKeys(event: FormEvent<HTMLInputElement>) {
    const newValue: string = event.currentTarget.value
    const newKey: string = newValue[newValue.length - 1]
    if (PHYSICAL_ALLOWED_KEYS.includes(newKey) && newValue.length > oldKeyboardValueLength) {
      setOldKeyboardValueLength((state) => state + 1)
      dispatch.currentCall.updateKeyboardValue(newValue)
    }
  }

  return (
    <div className='flex flex-col gap-7'>
      <div className='flex gap-4'>
        <Button variant='transparent' onClick={backToCall}>
          <FontAwesomeIcon size='xl' icon={faArrowLeft} />
        </Button>
        <input
          type='text'
          style={{
            caretColor: 'rgb(107 114 128)',
          }}
          onChange={handlePhysicalKeyboardKeys}
          value={keyboardValue}
          autoFocus
          className='w-full rounded-xl bg-black border border-gray-300 text-white font-sans font-light text-xl text-center px-2'
        />
      </div>
      <Actions keyCallback={keyPressedCallback} />
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
