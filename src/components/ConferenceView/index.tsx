// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { useTranslation } from 'react-i18next'
import Hangup from '../Hangup'
import ConferenceUsersList from './ConferenceUsersList'
import { ConferenceUser } from '../../models/conference'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightToBracket, faUserPlus } from '@fortawesome/free-solid-svg-icons'

export const WaitingConferenceView: FC<WaitingConferenceViewProps> = () => {
  const { settingsView, previousView } = useSelector((state: RootState) => state.island)
  const { t } = useTranslation()
  const dispatch = useDispatch<Dispatch>()

  return (
    <>
      <div className='pi-flex pi-flex-col pi-w-full'>
        {/* Header */}
        <div className='pi-flex pi-items-center pi-justify-between pi-text-gray-900 dark:pi-text-gray-50'>
          <h1 className='pi-text-lg pi-font-medium pi-leading-7'>
            {t('Conference.Waiting for the conference')}
          </h1>
          {/* TO-DO ADD TIMER */}
        </div>

        {/* User waiting list */}
        <ConferenceUsersList />
        <div className='pi-flex pi-justify-center pi-space-x-6 pi-mt-6'>
          <Button variant='default' className='pi-w-52'>
            <FontAwesomeIcon icon={faArrowRightToBracket} className='pi-mr-3' />
            {t('Conference.Start conference')}
          </Button>
          <Button variant='default' className=''>
            <FontAwesomeIcon icon={faUserPlus} className='' />
          </Button>
        </div>
      </div>
      <div className={`pi-absolute pi-bottom-0 pi-right-0 pi-w-full pi-pb-2`}>
        <Hangup buttonsVariant='default' />
      </div>
    </>
  )
}

export interface WaitingConferenceViewProps {}
