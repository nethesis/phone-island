// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCircleInfo, faMobile, faUser, faXmark } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Button } from '../Button'
import { Tooltip } from 'react-tooltip'
import { isEmpty } from '../../utils/genericFunctions/isEmpty'
import { blindTransferFunction } from '../../lib/phone/call'
import { faArrowsRepeat, faOfficePhone } from '@nethesis/nethesis-solid-svg-icons'
import { eventDispatch } from '../../utils'

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

  const blindTransferOnSelectedDevice = (deviceNumber: any) => {
    if (deviceNumber !== '') {
      blindTransferFunction(deviceNumber)
      eventDispatch('phone-island-call-switched', {})
    }
  }

  const transferCallOnDevice = (deviceInformation: any) => {
    setSelectedSwitchDevices(deviceInformation?.id)
  }

  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null)
  const [selectedSwitchDevices, setSelectedSwitchDevices]: any = useState('')

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
              className='pi-flex pi-w-4 pi-h-4 pi-text-indigo-800 dark:pi-text-indigo-300'
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
            <FontAwesomeIcon icon={faXmark} className='pi-w-5 pi-h-5' />
          </Button>
        </div>

        {/* Divider */}
        <div className='pi-border-t pi-border-gray-300 dark:pi-border-gray-600 pi-mt-[-0.5rem]' />

        {/* Devices List */}
        <div className='pi-flex pi-flex-col pi-mt-2 pi-h-[150px] pi-overflow-y-auto pi-space-y-2 pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'>
          {filteredDevices.map((device: any) => (
            <div
              key={device?.id}
              className='pi-flex pi-items-center pi-justify-between pi-px-4 pi-py-3 pi-text-base pi-font-normal pi-leading-6 dark:pi-text-gray-200 pi-text-gray-700 hover:pi-bg-gray-200 dark:hover:pi-bg-gray-700 dark:pi-bg-gray-950 pi-bg-gray-50 pi-rounded-md'
              onClick={() => transferCallOnDevice(device)}
              onMouseEnter={() => setHoveredDevice(device?.id)}
              onMouseLeave={() => setHoveredDevice(null)}
            >
              <div className='pi-flex pi-items-center pi-max-w-60 pi-truncate'>
                <FontAwesomeIcon
                  icon={
                    device?.type === 'mobile'
                      ? faMobile
                      : device?.type === 'physical'
                      ? faOfficePhone
                      : faUser
                  }
                  className='pi-mr-2 pi-w-5 pi-h-5'
                />
                <span className='pi-truncate'>
                  {device?.type === 'mobile'
                    ? t('Phone Island.Mobile app')
                    : device?.type === 'physical'
                    ? device?.description
                    : '-'}
                </span>
              </div>
              <div className='pi-flex pi-items-center'>
                {selectedSwitchDevices === device?.id && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={`${
                      hoveredDevice === device?.id
                        ? 'pi-text-gray-700 dark:pi-text-gray-200'
                        : 'pi-text-emerald-700 dark:pi-text-emerald-500'
                    } pi-w-5 pi-h-5`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Centered Button */}
        <div className='pi-flex pi-justify-center'>
          <Button
            disabled={selectedSwitchDevices === ''}
            variant='gray'
            className='pi-font-medium pi-text-sm pi-leading-5'
            onClick={() => blindTransferOnSelectedDevice(selectedSwitchDevices)}
          >
            <FontAwesomeIcon className='pi-w-6 pi-h-6 pi-mr-2' icon={faArrowsRepeat} />
            <span>{t('Phone Island.Switch device')}</span>
          </Button>
        </div>
      </div>
      <Tooltip className='pi-z-20' id='tooltip-close-settings' place='bottom' />
      <Tooltip className='pi-z-20' id='tooltip-switch-information' place='bottom' />
    </>
  )
}

export interface SwitchDeviceViewProps {}
