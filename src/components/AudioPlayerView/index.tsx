// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { Avatar } from './Avatar'
import { AudioBars } from '../AudioBars'
import Progress from './Progress'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause } from '@nethesis/nethesis-solid-svg-icons'

export const KeypadView: FC<KeypadViewTypes> = () => {
  const { audioPlayerTrackType, audioPlayerTrackName, audioPlayer, audioPlayerPlaying } =
    useSelector((state: RootState) => state.player)
  const { isOpen } = useSelector((state: RootState) => state.island)

  return (
    <div className='pi-flex pi-gap-7 pi-flex-col'>
      <div className='pi-flex pi-gap-4'>
        <Avatar type={audioPlayerTrackType} />
        <div className='pi-flex pi-items-center pi-w-full'>
          <div
            style={{
              width: isOpen ? '202px' : '60px',
            }}
            className={`pi-text-base pi-overflow-hidden pi-text-ellipsis pi-whitespace-nowrap pi-inline-block`}
          >
            {audioPlayerTrackName}
          </div>
        </div>
        <AudioBars
          audioElement={audioPlayer && audioPlayer.current}
          size={isOpen ? 'large' : 'small'}
        />
      </div>
      {isOpen && (
        <div>
          <Progress />
          <div className='pi-w-full pi-flex pi-justify-center pi-items-center pi-mt-6'>
            <Button variant='default' className='pi-scale-110'>
              {audioPlayerPlaying ? (
                <FontAwesomeIcon icon={faPause} size='xl' />
              ) : (
                <FontAwesomeIcon icon={faPlay} size='xl' />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default KeypadView

export interface KeypadViewTypes {}
