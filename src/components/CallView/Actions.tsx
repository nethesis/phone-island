// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import {
  faPause as faPauseRegular,
  faMicrophone as faMicrophoneRegular,
  faRightLeft as faRightLeftRegualar,
} from '@nethesis/nethesis-light-svg-icons'
import {
  muteCurrentCall,
  unmuteCurrentCall,
  pauseCurrentCall,
  unpauseCurrentCall,
} from '../../lib/phone/call'
import PhoneKeypadLight from '../../static/icons/PhoneKeypadLight'
import PhoneKeypadSolid from '../../static/icons/PhoneKeypadSolid'
import { Button } from '../'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophoneSlash, faPlay } from '@nethesis/nethesis-solid-svg-icons'
import { RootState, Dispatch } from '../../store'
import { useSelector, useDispatch } from 'react-redux'

const Actions: FC = () => {
  // Get multiple values from currentCall store
  const { paused, muted } = useSelector((state: RootState) => state.currentCall)

  // Get isOpen and view from island store
  const { view } = useSelector((state: RootState) => state.island)

  const dispatch = useDispatch<Dispatch>()

  function openKeypad() {
    dispatch.island.setIslandView(view !== 'keypad' ? 'keypad' : 'call')
  }

  function transfer() {
    dispatch.island.setIslandView(view !== 'transfer_list' ? 'transfer_list' : 'call')
  }

  return (
    <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
      <Button
        variant='default'
        active={paused ? true : false}
        onClick={() => (paused ? unpauseCurrentCall() : pauseCurrentCall())}
      >
        {paused ? (
          <FontAwesomeIcon size='xl' icon={faPlay} />
        ) : (
          <FontAwesomeIcon size='xl' icon={faPauseRegular} />
        )}
      </Button>
      <Button
        variant='default'
        active={muted ? true : false}
        onClick={() => (muted ? unmuteCurrentCall() : muteCurrentCall())}
      >
        {muted ? (
          <FontAwesomeIcon size='xl' icon={faMicrophoneSlash} />
        ) : (
          <FontAwesomeIcon size='xl' icon={faMicrophoneRegular} />
        )}
      </Button>
      <Button onClick={transfer} variant='default'>
        <FontAwesomeIcon size='xl' icon={faRightLeftRegualar} />
      </Button>
      <Button variant='default' onClick={openKeypad}>
        {view === 'keypad' ? <PhoneKeypadSolid /> : <PhoneKeypadLight />}
      </Button>
    </div>
  )
}

export default Actions
