// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { StyledNumber } from '../../styles/Island.styles'

const Number: FC = () => {
  const { number } = useSelector((state: RootState) => state.currentCall)
  const { isOpen } = useSelector((state: RootState) => state.island)

  return <StyledNumber isOpen={isOpen}>{number && number !== '<unknown>' && number}</StyledNumber>
}

export default Number
