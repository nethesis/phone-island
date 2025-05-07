// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { Avatar } from './Avatar'
import Progress from './Progress'
import { useTranslation } from 'react-i18next'
import PlayerFooterActions from './PlayerFooterActions'
import { Button } from '../Button'
import { eventDispatch } from '../../utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export const KeypadView: FC<KeypadViewTypes> = () => {
  const { audioPlayerTrackType, audioPlayerTrackName, audioPlayer, audioPlayerPlaying } =
    useSelector((state: RootState) => state.player)
  const { isOpen } = useSelector((state: RootState) => state.island)

  function stopPropagation(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    e.stopPropagation()
  }

  const { t } = useTranslation()

  // Initialize state dispatch
  const dispatch = useDispatch<Dispatch>()

  function playerClose() {
    if (audioPlayerPlaying) {
      dispatch.player.stopAudioPlayer()
      eventDispatch('phone-island-audio-player-close', {})
    }
    dispatch.island.resetPlayerClose()
  }

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
        <Button
          onClick={() => playerClose()}
          variant='transparentSettings'
          data-tooltip-id='tooltip-close-settings'
          data-tooltip-content={t('Common.Close') || ''}
        >
          <FontAwesomeIcon icon={faXmark} className='pi-w-5 pi-h-5' />
        </Button>
      </div>
      {isOpen && (
        <div onClick={stopPropagation} onMouseDown={stopPropagation} onTouchStart={stopPropagation}>
          {/* add prop to indicate that is audioplayer view */}
          <Progress isPlayer />
          <PlayerFooterActions />
        </div>
      )}
      {/* Buttons tooltips */}
    </div>
  )
}

export default KeypadView

export interface KeypadViewTypes {}
