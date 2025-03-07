// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef } from 'react'
import { Button } from '../Button'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import Actions from './Actions'
import { sendDTMF } from '../../lib/webrtc/messages'
import { backToPreviousView } from '../../lib/island/island'
import { playDtmfAudio } from '../../lib/phone/call'
import { useTranslation } from 'react-i18next'
import { isWebRTC } from '../../lib/user/default_device'
import { sendPhysicalDTMF } from '../../services/astproxy'
import { useEventListener, eventDispatch } from '../../utils'
import { CustomThemedTooltip } from '../CustomThemedTooltip'

const DTMF_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#']

const KeypadView: FC<KeypadViewTypes> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { keypadValue } = useSelector((state: RootState) => state.currentCall)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const keypadValueRef = useRef<typeof keypadValue>(keypadValue)

  function sendKey(key: string) {
    dispatch.currentCall.updateKeypadValue(`${keypadValueRef.current}${key}`)
    keypadValueRef.current = `${keypadValueRef.current}${key}`
    playDtmfAudio(key)
    if (isWebRTC()) {
      sendDTMF(key)
    } else {
      sendPhysicalDTMF(key)
    }

    eventDispatch('phone-island-call-keypad-sent', {})
  }
  useEventListener('phone-island-call-keypad-send', (data: KeypadTypes) => {
    sendKey(data.key)
  })

  useEffect(() => {
    function handlePhysicalKeydown(event) {
      if (DTMF_KEYS.includes(event.key)) {
        sendKey(event.key)
      }
    }
    window.addEventListener('keydown', handlePhysicalKeydown)
    return () => window.removeEventListener('keydown', handlePhysicalKeydown)
  }, [])

  const { t } = useTranslation()

  return (
    <>
      {isOpen ? (
        <div className='pi-flex pi-flex-col pi-gap-7'>
          <div className='pi-flex pi-gap-4'>
            <Button
              variant='transparent'
              onClick={backToPreviousView}
              data-tooltip-id='keyboard-tooltip'
              data-tooltip-content={t('Tooltip.Back to call') || ''}
            >
              <FontAwesomeIcon size='xl' icon={faArrowLeft} />
            </Button>
            <input
              data-stop-propagation={true}
              type='text'
              readOnly
              placeholder={t('Common.Enter a phone number') || ''}
              value={keypadValue}
              autoFocus
              className='pi-w-full pi-rounded-full dark:pi-bg-gray-950 pi-bg-gray-50 pi-border-2 pi-border-emerald-500 dark:pi-border-emerald-200 active:pi-border-emerald-500 dark:active:focus:pi-border-emerald-200 focus:pi-border-emerald-500 dark:focus:pi-border-emerald-200 pi-text-gray-700 dark:pi-text-white pi-font-light pi-text-xl pi-text-center pi-px-2 focus:pi-outline-0 focus:pi-ring-0 pi-placeholder-gray-800 dark:pi-placeholder-gray-200 pi-placeholder-text-xs'
            />
          </div>
          <Actions keyCallback={sendKey} />
        </div>
      ) : (
        <div className='pi-font-medium pi-text-base'>Keypad</div>
      )}
      <CustomThemedTooltip className='pi-z-1000' id='keyboard-tooltip' place='right' />
    </>
  )
}

export default KeypadView

export interface KeypadViewTypes {}

interface KeypadTypes {
  key: string
}
