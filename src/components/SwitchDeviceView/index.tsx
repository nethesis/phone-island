// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCircleInfo, faMobile, faUser, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import { isEmpty } from '../../utils/genericFunctions/isEmpty'
import { blindTransferFunction } from '../../lib/phone/call'
import { faArrowsRepeat, faOfficePhone } from '@nethesis/nethesis-solid-svg-icons'
import { eventDispatch } from '../../utils'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { useTranslation } from 'react-i18next'
import { getAvailableDevices } from '../../utils/deviceUtils'
import { changeDefaultDevice } from '../../services/user'

export const SwitchDeviceView: FC<SwitchDeviceViewProps> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { t } = useTranslation()

  const userInformation: any = useSelector((state: RootState) => state?.currentUser)
  const allUsersInformation: any = useSelector((state: RootState) => state?.users)

  // Extract devices with active conversations:
  // Get IDs of devices with active conversations
  const activeConversationIds = Object.keys(userInformation?.conversations || {}).filter(
    (id) => !isEmpty(userInformation.conversations[id]),
  )

  const filteredDevices = getAvailableDevices(userInformation, allUsersInformation)

  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null)
  const [selectedSwitchDevices, setSelectedSwitchDevices] = useState({ id: '', type: '' })

  // Get the first device ID with active conversation
  const extensionInCall = activeConversationIds[0]

  const transferCallOnDevice = (device: any) => {
    setSelectedSwitchDevices({
      id: device?.id,
      type: device?.type,
    })
  }

  const setMainDeviceId = async (device: any) => {
    let deviceExtension: any = {}
    if (device) {
      deviceExtension.id = device?.id
      try {
        await changeDefaultDevice(deviceExtension)
        dispatch.user.updateDefaultDevice(device)
      } catch (err) {
        console.log(err)
      }
    }
  }

  const blindTransferOnSelectedDevice = (endpointIdInConversation: string) => {
    if (selectedSwitchDevices?.id && endpointIdInConversation) {
      if (
        selectedSwitchDevices?.type == 'physical' &&
        userInformation?.default_device?.type === 'physical'
      ) {
        dispatch.island.toggleAvoidToShow(false)
        blindTransferFunction(selectedSwitchDevices?.id, endpointIdInConversation)
        eventDispatch('phone-island-call-switched', {})
      } else if (
        selectedSwitchDevices?.type === 'physical' &&
        userInformation?.default_device?.type === 'nethlink'
      ) {
        dispatch.island.toggleAvoidToShow(false)
        setMainDeviceId(selectedSwitchDevices)
        dispatch.currentUser.updateCurrentDefaultDevice(selectedSwitchDevices)
        eventDispatch('phone-island-default-device-changed', {})
        setTimeout(() => {
          blindTransferFunction(selectedSwitchDevices?.id, endpointIdInConversation)
          eventDispatch('phone-island-call-switched', {})
        }, 500)
        eventDispatch('phone-island-call-switched', {})
      } else if (
        selectedSwitchDevices?.type === 'mobile' ||
        (selectedSwitchDevices?.type === 'physical' &&
          userInformation?.default_device?.type !== 'nethlink')
      ) {
        dispatch.island.toggleAvoidToShow(true)
        blindTransferFunction(selectedSwitchDevices?.id, endpointIdInConversation)
        eventDispatch('phone-island-call-switched', {})
      }
    }
  }

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
        <div className='pi-border-t pi-border-gray-300 dark:pi-border-gray-600 pi-mt-1' />

        {/* Devices List*/}
        <div className='pi-flex pi-flex-col pi-mt-2 pi-h-40 pi-overflow-y-auto pi-space-y-2 pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'>
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
                {selectedSwitchDevices.id === device?.id && (
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
        <div className='pi-flex pi-justify-center pi-mt-2'>
          <Button
            disabled={selectedSwitchDevices?.id === ''}
            variant='gray'
            className='pi-font-medium pi-text-sm pi-leading-5'
            onClick={() => blindTransferOnSelectedDevice(extensionInCall)}
          >
            <FontAwesomeIcon className='pi-w-6 pi-h-6 pi-mr-2' icon={faArrowsRepeat} />
            <span>{t('Switch device.Switch device')}</span>
          </Button>
        </div>
      </div>
      <CustomThemedTooltip id='tooltip-close-settings' place='bottom' />
      <CustomThemedTooltip id='tooltip-switch-information' place='bottom' />
    </>
  )
}

export interface SwitchDeviceViewProps {}
