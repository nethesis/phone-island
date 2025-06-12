// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled, { css } from 'styled-components'

export const StyledDetails = styled.div<StyledDetailsProps>`
  display: grid;
  align-self: center;
  grid-gap: 0.25rem;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(2, 24px);
`

export const StyledTimer = styled.div<StyledTimerProps>`
  ${({ isOpen, size }) =>
    size === 'large' ? (isOpen ? 'font-size: 1.125rem' : 'font-size: 1.125rem') : 'font-size: 1rem'};
  height: fit-content;
  letter-spacing: 0.5px;
  max-width: fit-content;
`

export const StyledNumber = styled.div<StyledNumberProps>`
  ${({ isOpen }) => (isOpen ? 'font-size:1.25rem' : 'font-size:1.2rem')};
  max-height: 24px;
  font-weight: 300;
  letter-spacing: 0.5px;
  max-width: fit-content;
`

export const StyledName = styled.div`
  font-size: 1.125rem;
  font-weight: 500;
`

interface StyledDetailsProps {
  numberExists?: boolean
}

interface StyledTimerProps {
  isOpen: boolean
  size: 'small' | 'large'
}

interface StyledNumberProps {
  isOpen: boolean
}
