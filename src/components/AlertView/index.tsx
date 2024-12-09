// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCircleXmark, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import { t } from 'i18next'
import { eventDispatch } from '../../utils'

/**
 * Shows user alerts
 */
const AlertView: FC = () => {
  const { data } = useSelector((state: RootState) => state.alerts)
  const dispatch = useDispatch<Dispatch>()

  // Extract active alerts
  const activeAlerts = Object.values(data).filter((alert: any) => alert.active)

  // Display the latest active alert
  const latestAlert = activeAlerts.length > 0 ? activeAlerts[activeAlerts.length - 1] : null

  const handleClearAllAlerts = () => {
    dispatch.alerts.removeAllAlerts()
    eventDispatch('phone-island-all-alerts-removed', {})
  }

  return (
    latestAlert && (
      <div className='pi-relative pi-rounded-md pi-w-full pi-flex'>
        <div className='pi-flex pi-items-center'>
          <div
            className={`pi-flex pi-items-center pi-justify-center pi-flex-shrink-0 pi-mr-4 pi-rounded-full pi-h-10 pi-w-10 ${
              latestAlert?.type === 'call_transfered'
                ? 'pi-bg-green-200 dark:pi-bg-green-900'
                : 'pi-bg-rose-200 dark:pi-bg-rose-900'
            }`}
          >
            {/* Icon */}
            <FontAwesomeIcon
              icon={latestAlert?.type === 'call_transfered' ? faCircleCheck : faCircleXmark}
              className={`pi-h-[1.1rem] pi-w-10 ${
                latestAlert?.type === 'call_transfered'
                  ? 'pi-text-green-700 dark:pi-text-green-200'
                  : 'pi-text-rose-700 dark:pi-text-rose-200'
              }`}
              aria-hidden='true'
            />
          </div>

          <div className='ml-3'>
            <h3 className='pi-text-lg pi-font-medium pi-text-gray-900 dark:pi-text-gray-50 pi-dark:text-rose-100 margin-block-property'>
              {t(`Errors.${latestAlert?.type}`)}
            </h3>
            <div className='pi-text-sm pi-font-normal pi-text-gray-700 dark:pi-text-gray-200 pi-dark:text-rose-200 pi-leading-5'>
              {t(`Errors.${latestAlert?.message}`)}
            </div>
          </div>
        </div>

        {/* Close button */}
        <Button
          variant='transparent'
          onClick={() => handleClearAllAlerts()}
          className='pi-absolute pi-right-[-1.28rem] pi-top-[8%] pi-transform pi--translate-y-[57%]'
        >
          <FontAwesomeIcon
            icon={faTimes}
            className='pi-text-gray-700 dark:pi-text-gray-50 pi-w-4 pi-h-4'
          />
        </Button>
      </div>
    )
  )
}

export default AlertView
