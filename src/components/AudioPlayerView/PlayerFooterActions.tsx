import React, { type FC } from 'react'
import { useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlay,
  faPause,
  faDownLeftAndUpRightToCenter,
  faGear,
} from '@fortawesome/free-solid-svg-icons'
import { eventDispatch, useEventListener } from '../../utils'
import { Button } from '../Button'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { useTranslation } from 'react-i18next'

export const PlayerFooterActions: FC<PlayerFooterActionsTypes> = () => {
  const { audioPlayerPlaying } = useSelector((state: RootState) => state.player)
  const { t } = useTranslation()

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

  return (
    <div
      className={`pi-flex pi-items-center pi-justify-between pi-px-6 pi-gap-0 pi-w-full pi-mt-auto`}
    >
      <Button variant='transparent' disabled>
        <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} className='pi-w-6 pi-h-6' />
      </Button>

      <div className='pi-flex pi-items-center pi-justify-center'>
        <Button
          onClick={audioPlayerPlaying ? pausePlaying : startPlaying}
          variant='default'
          className='pi-rounded-full pi-bg-white pi-w-14 pi-h-14 pi-flex pi-items-center pi-justify-center'
          data-tooltip-id='tooltip-confirm-record-view'
          data-tooltip-content={t('Tooltip.Confirm') || ''}
        >
          {audioPlayerPlaying ? (
            <FontAwesomeIcon icon={faPause} className='pi-h-6 pi-w-6' />
          ) : (
            <FontAwesomeIcon icon={faPlay} className='pi-h-6 pi-w-6' />
          )}
        </Button>
      </div>

      <div
        onClick={() => dispatch.island.setIslandView('settings')}
        data-tooltip-id='tooltip-settings-view-recorder'
        data-tooltip-content={t('Tooltip.Go to settings') || ''}
        className='pi-flex-none pi-items-center pi-cursor-pointer pi-text-gray-700 dark:pi-text-gray-200'
      >
        <FontAwesomeIcon icon={faGear} className={`pi-h-6 pi-w-6`} />
      </div>

      {/* Buttons tooltips */}
      <CustomThemedTooltip id='tooltip-settings-view-recorder' place='top' />
      <CustomThemedTooltip id='tooltip-pause-audio-player' place='bottom' />
    </div>
  )
}

export default PlayerFooterActions
export interface PlayerFooterActionsTypes {}
