// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { StyledNumber } from '../../styles/Island.styles'
import { useTranslation } from 'react-i18next'

const Number: FC = () => {
  const { number, displayName } = useSelector((state: RootState) => state.currentCall)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { t } = useTranslation()

  // When the counterpart is not in the phonebook, getDisplayName falls back to the
  // number itself, so it is already shown as the display name. Rendering it here too
  // would duplicate the number (display name + number), so skip it in that case.
  if (number && displayName && number === displayName) {
    return null
  }

  const displayNumber =
    number === 'unknown' ? t('TextScroll.unknown') : number || t('Call.In progress...') || '-'

  return (
    <StyledNumber isOpen={isOpen}>
      <span className='dark:pi-text-gray-50 pi-text-gray-600'>{displayNumber}</span>
    </StyledNumber>
  )
}

export default Number
