// Copyright (C) 2024 Nethesis S.r.l.
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
import { Tooltip } from 'react-tooltip'
import { useTranslation } from 'react-i18next'
import { useEventListener, eventDispatch } from '../../utils'

export const KeypadView: FC<KeypadViewTypes> = () => {
  const { audioPlayerTrackType, audioPlayerTrackName, audioPlayer, audioPlayerPlaying } =
    useSelector((state: RootState) => state.player)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const dispatch = useDispatch<Dispatch>()

  function startPlaying() {
    dispatch.player.startAudioPlayer(() => {})
    eventDispatch('phone-island-audio-player-played', {})
  }
  useEventListener('phone-island-audio-player-play', (data: {}) => {
    startPlaying()
  })

  function pausePlaying() {
    dispatch.player.pauseAudioPlayer()
    eventDispatch('phone-island-audio-player-paused', {})
  }
  useEventListener('phone-island-audio-player-pause', (data: {}) => {
    pausePlaying()
  })

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
              data-tooltip-id='tooltip-pause-audio-player'
              data-tooltip-content={audioPlayerPlaying ? `${t('Tooltip.Pause')}` : `${t('Tooltip.Play')}`}
            >
              {audioPlayerPlaying ? (
                <FontAwesomeIcon icon={faPause} className='pi-h-6 pi-w-6' />
              ) : (
                <FontAwesomeIcon icon={faPlay} className='pi-h-6 pi-w-6' />
              )}
            </Button>
          </div>
        </div>
      )}
      {/* Buttons tooltips */}
      <Tooltip className='pi-z-20' id='tooltip-pause-audio-player' place='bottom' />
    </div>
  )
}

export default KeypadView

export interface KeypadViewTypes {}
