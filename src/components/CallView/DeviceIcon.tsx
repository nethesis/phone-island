// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faDesktop, faHeadset, faMobileScreen } from '@fortawesome/free-solid-svg-icons'
import { faOfficePhone } from '@nethesis/nethesis-solid-svg-icons'
import { RootState } from '../../store'
import { getMainExtensionNumber } from '../../lib/phone/counterpartDevice'

export const DEVICE_TOOLTIP_ID = 'tooltip-device'

const DEVICE_ICONS: Record<string, { icon: IconProp; labelKey: string }> = {
  webrtc: { icon: faHeadset, labelKey: 'Call.Web phone' },
  nethlink: { icon: faDesktop, labelKey: 'Call.Desktop phone' },
  physical: { icon: faOfficePhone as IconProp, labelKey: 'Common.Physical phone' },
  mobile: { icon: faMobileScreen, labelKey: 'Phone Island.Mobile app' },
}

const DeviceIcon: FC = () => {
  const { t } = useTranslation()
  const counterpartDeviceType = useSelector(
    (state: RootState) => state.currentCall.counterpartDeviceType,
  )
  const number = useSelector((state: RootState) =>
    getMainExtensionNumber(state.currentCall.number, state.users),
  )

  const device = counterpartDeviceType ? DEVICE_ICONS[counterpartDeviceType] : undefined
  if (!device) return null

  const label = t(device.labelKey)
  const tooltipContent = number ? `${label}: ${number}` : label

  return (
    <span
      className='pi-inline-flex pi-flex-none pi-items-center pi-justify-center pi-h-5 pi-w-5 pi-text-iconPrimaryNeutral dark:pi-text-iconPrimaryNeutralDark'
      data-tooltip-id={DEVICE_TOOLTIP_ID}
      data-tooltip-content={tooltipContent}
      aria-label={tooltipContent}
    >
      <FontAwesomeIcon icon={device.icon} className='pi-h-5 pi-w-5' />
    </span>
  )
}

export default memo(DeviceIcon)
