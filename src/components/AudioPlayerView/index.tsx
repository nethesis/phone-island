// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { Avatar } from './Avatar'
import { AudioBars } from '../AudioBars'

export const KeypadView: FC<KeypadViewTypes> = () => {
  const { audioPlayerTrackType, audioPlayerTrackName, audioPlayer } = useSelector(
    (state: RootState) => state.player,
  )
  const { isOpen } = useSelector((state: RootState) => state.island)

  return (
    <>
      <div className='pi-flex pi-gap-4'>
        <Avatar type={audioPlayerTrackType} />
        <div className='pi-flex pi-items-center pi-w-fit'>
          <div
            className={`pi-text-base ${
              isOpen ? 'pi-w-56' : 'pi-w-16'
            } pi-overflow-hidden pi-text-ellipsis pi-whitespace-nowrap pi-inline-block`}
          >
            {audioPlayerTrackName}
          </div>
        </div>
        <AudioBars audioElement={audioPlayer} size={isOpen ? 'large' : 'small'} />
      </div>
    </>
  )
}

export default KeypadView

export interface KeypadViewTypes {}
