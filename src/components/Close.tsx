// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import React, { type FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../store'
import { eventDispatch } from '../utils'

export const Close: FC = () => {
  const { view } = useSelector((state: RootState) => state.island)
  const { audioPlayerPlaying } = useSelector((state: RootState) => state.player)
  const dispatch = useDispatch<Dispatch>()

  function playerClose() {
    if (audioPlayerPlaying) {
      dispatch.player.stopAudioPlayer()
      eventDispatch('phone-island-audio-player-close', {})
    }
    dispatch.island.resetPlayerClose()
  }

  function close() {
    dispatch.island.resetPlayerClose()
  }

  return (
    <>
      {(view === 'player' || view === 'recorder') && (
        <div className='pi-flex pi-justify-center'>
          <div
            onClick={view === 'player' ? playerClose : close}
            className='pi-h-9 pi-w-9 pi-rounded-full dark:pi-bg-gray-950 pi-bg-gray-50 hover:pi-bg-gray-500 hover:pi-text-gray-50 dark:hoverpi-text-gray-700 pi-flex pi-items-center pi-justify-center dark:pi-text-white pi-text-gray-900 pi-mt-4 pi-pointer-events-auto pi-cursor-pointer pi-transition-colors'
          >
            <FontAwesomeIcon icon={faXmark} size='lg' />
          </div>
        </div>
      )}
    </>
  )
}

export default Close
