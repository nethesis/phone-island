// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { StyledNumber } from '../../styles/Island.styles'
import { useTranslation } from 'react-i18next'

const Number: FC = () => {
  const { number } = useSelector((state: RootState) => state.currentCall)
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { t } = useTranslation()

  const displayNumber =
    number === 'unknown' ? t('TextScroll.unknown') : number || t('Call.In progress...') || '-'

  return (
    <StyledNumber isOpen={isOpen} className='dark:pi-text-gray-50 pi-text-gray-600'>
      {displayNumber}
    </StyledNumber>
  )
}

export default Number
