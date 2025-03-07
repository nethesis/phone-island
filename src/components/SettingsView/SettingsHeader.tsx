import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import { Dispatch, RootState } from '../../store'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { useTranslation } from 'react-i18next'

interface SettingsHeaderProps {
  title: string
  tooltipPrefix: string
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, tooltipPrefix }) => {
  const dispatch = useDispatch<Dispatch>()
  const { t } = useTranslation()
  const { previousView } = useSelector((state: RootState) => state.island)

  const closeSettings = () => {
    // Reset settings view to main
    dispatch.island.setSettingsView('main')
    // Go to previous view (e.g. 'call' or 'video')
    dispatch.island.setIslandView(`${previousView || 'call'}`)
  }

  return (
    <>
      <div className='pi-flex pi-items-center pi-justify-between'>
        <div className='pi-flex pi-items-center pi-gap-2 pi-text-gray-900 dark:pi-text-gray-50'>
          <Button
            onClick={() => dispatch.island.setSettingsView('main')}
            variant='transparentSettings'
            data-tooltip-id={`tooltip-back-${tooltipPrefix}-settings`}
            data-tooltip-content={t('Common.Back') || ''}
          >
            <FontAwesomeIcon icon={faAngleLeft} className='pi-w-5 pi-h-5' />
          </Button>
          <h1 className='pi-text-lg pi-font-medium pi-leading-7'>{title}</h1>
        </div>
        <Button
          onClick={() => closeSettings()}
          variant='transparentSettings'
          data-tooltip-id={`tooltip-close-${tooltipPrefix}-settings`}
          data-tooltip-content={t('Common.Close') || ''}
        >
          <FontAwesomeIcon icon={faXmark} className='pi-w-5 pi-h-5' />
        </Button>
      </div>
      {/* Divider */}
      <div className='pi-border-t pi-border-gray-300 dark:pi-border-gray-600 pi-mt-1' />
      <CustomThemedTooltip id={`tooltip-back-${tooltipPrefix}-settings`} place='bottom' />
      <CustomThemedTooltip id={`tooltip-close-${tooltipPrefix}-settings`} place='bottom' />
    </>
  )
}
