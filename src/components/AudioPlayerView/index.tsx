// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { Avatar } from './Avatar'
import { AudioBars } from '../AudioBars'
import Progress from './Progress'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tooltip/dist/react-tooltip.min.cjs'
import { useTranslation } from 'react-i18next'

export const KeypadView: FC<KeypadViewTypes> = () => {
  const { audioPlayerTrackType, audioPlayerTrackName, audioPlayer, audioPlayerPlaying } =
    useSelector((state: RootState) => state.player)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const dispatch = useDispatch<Dispatch>()

  function startPlaying() {
    dispatch.player.startAudioPlayer(() => {})
  }

  function pausePlaying() {
    dispatch.player.pauseAudioPlayer()
  }

  const { t } = useTranslation()

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
          <div className='pi-w-full pi-flex pi-justify-center pi-items-center pi-pt-7'>
            <Button
              onClick={audioPlayerPlaying ? pausePlaying : startPlaying}
              variant='default'
              style={{ transform: 'scale(1.15)' }}
              data-tooltip-id='tooltip'
              data-tooltip-content={audioPlayerPlaying ? `${t('Tooltip.Pause')}` : `${t('Tooltip.Play')}`}
            >
              {audioPlayerPlaying ? (
                <FontAwesomeIcon icon={faPause} size='xl' />
              ) : (
                <FontAwesomeIcon icon={faPlay} size='xl' />
              )}
            </Button>
          </div>
        </div>
      )}
      {/* Buttons tooltips */}
      <Tooltip className='pi-z-20' id='tooltip' place='bottom' />
    </div>
  )
}

export default KeypadView

export interface KeypadViewTypes {}
