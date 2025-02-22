import React from 'react'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import { Dispatch } from '../../store'
import { t } from 'i18next'
import { CustomThemedTooltip } from '../CustomThemedTooltip'

interface SettingsHeaderProps {
  title: string
  tooltipPrefix: string
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, tooltipPrefix }) => {
  const dispatch = useDispatch<Dispatch>()

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
          onClick={() => dispatch.island.setIslandView('call')}
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
