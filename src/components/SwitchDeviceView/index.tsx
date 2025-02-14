// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Button } from '../Button'
import { Tooltip } from 'react-tooltip'
import { isEmpty } from '../../utils/genericFunctions/isEmpty'

export const SwitchDeviceView: FC<SwitchDeviceViewProps> = () => {
  const dispatch = useDispatch<Dispatch>()

  const userInformation = useSelector((state: RootState) => state?.currentUser)
  const allUsersInformation: any = useSelector((state: RootState) => state?.users)

  // Extract devices with active conversations:
  const activeConversationDevices = new Set(
    Object.keys(userInformation?.conversations || {}).filter(
      (key) => !isEmpty(userInformation.conversations[key]),
    ),
  )
  // A device will be in the list only if it is online and not in an active conversation
  const filteredDevices = (userInformation?.endpoints?.extension || []).filter((device) => {
    const userStatus = allUsersInformation?.extensions[device?.id]?.status
    return !activeConversationDevices.has(device?.id) && userStatus === 'online'
  })

  return (
    <>
      <div className='pi-flex pi-flex-col pi-w-full'>
        {/* Header */}
        <div className='pi-flex pi-items-center pi-justify-between'>
          <div className='pi-flex pi-items-center pi-space-x-2'>
            <h1 className='pi-flex pi-text-lg pi-font-medium pi-text-gray-900 dark:pi-text-gray-50'>
              {t('Switch device.Switch device') || ''}
            </h1>
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='pi-flex pi-w-4 pi-h-4 pi-text-indigo-800'
              data-tooltip-id='tooltip-switch-information'
              data-tooltip-content={t('Switch device.Switch information') || ''}
            />
          </div>

          <Button
            onClick={() => dispatch.island.setIslandView('call')}
            variant='transparentSettings'
            data-tooltip-id='tooltip-close-settings'
            data-tooltip-content={t('Common.Close') || ''}
          >
            <FontAwesomeIcon icon={faXmark} size='lg' />
          </Button>
        </div>

        {/* Divider */}
        <div className='pi-border-t pi-border-gray-300 dark:pi-border-gray-600 pi-mt-[-0.5rem]' />

        {/* Devices List */}
        <div className='pi-flex pi-flex-col pi-mt-2 pi-max-h-[300px] pi-overflow-y-auto pi-space-y-2'>
          {filteredDevices.map((device) => (
            <div
              key={device.id}
              className='pi-flex pi-items-center pi-space-x-3 pi-px-4 pi-py-2 pi-rounded-lg pi-bg-gray-100 dark:pi-bg-gray-800 pi-cursor-pointer pi-transition pi-duration-200 hover:pi-bg-indigo-200 dark:hover:pi-bg-indigo-700'
            >
              <FontAwesomeIcon
                icon={faCircleInfo}
                className='pi-text-gray-600 dark:pi-text-gray-300'
              />

              <div className='pi-flex pi-flex-col'>
                <span className='pi-text-sm pi-font-medium pi-text-gray-900 dark:pi-text-gray-50'>
                  {device.username}
                </span>
                <span className='pi-text-xs pi-text-gray-500 dark:pi-text-gray-400'>
                  {device.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Tooltip className='pi-z-20' id='tooltip-close-settings' place='bottom' />
      <Tooltip className='pi-z-20' id='tooltip-switch-information' place='bottom' />
    </>
  )
}

export interface SwitchDeviceViewProps {}
