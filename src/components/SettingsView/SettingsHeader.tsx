import React from 'react'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import { Dispatch } from '../../store'
import { Tooltip } from 'react-tooltip'
import { t } from 'i18next'

interface SettingsHeaderProps {
  title: string
  tooltipPrefix: string
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, tooltipPrefix }) => {
  const dispatch = useDispatch<Dispatch>()

  return (
    <>
      <div className='pi-flex pi-items-center pi-justify-between'>
        <div className='pi-flex pi-items-center pi-gap-2'>
          <Button
            onClick={() => dispatch.island.setSettingsView('main')}
            variant='transparentSettings'
            data-tooltip-id={`tooltip-back-${tooltipPrefix}-settings`}
            data-tooltip-content={t('Common.Back') || ''}
          >
            <FontAwesomeIcon icon={faAngleLeft} size='lg' />
          </Button>
          <h1 className='pi-text-lg pi-font-medium pi-text-gray-900 dark:pi-text-gray-50'>
            {title}
          </h1>
        </div>
        <Button
          onClick={() => dispatch.island.setIslandView('call')}
          variant='transparentSettings'
          data-tooltip-id={`tooltip-close-${tooltipPrefix}-settings`}
          data-tooltip-content={t('Common.Close') || ''}
        >
          <FontAwesomeIcon icon={faXmark} size='lg' />
        </Button>
      </div>
      <Tooltip className='pi-z-20' id={`tooltip-back-${tooltipPrefix}-settings`} place='bottom' />
      <Tooltip className='pi-z-20' id={`tooltip-close-${tooltipPrefix}-settings`} place='bottom' />
    </>
  )
}
