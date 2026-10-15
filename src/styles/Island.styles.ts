// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled from 'styled-components'

export const StyledTimer = styled.div<React.PropsWithChildren<StyledTimerProps>>`
  ${({ isOpen, size }) =>
    size === 'large' ? (isOpen ? 'font-size: 1.125rem' : 'font-size: 1.125rem') : 'font-size: 1rem'};
  height: fit-content;
  letter-spacing: 0.5px;
  max-width: fit-content;
`

export const StyledNumber = styled.div<React.PropsWithChildren<StyledNumberProps>>`
  ${({ isOpen }) => (isOpen ? 'font-size:1.25rem' : 'font-size:1.2rem')};
  max-height: 24px;
  font-weight: 300;
  letter-spacing: 0.5px;
  max-width: fit-content;
`

interface StyledTimerProps {
  isOpen: boolean
  size: 'small' | 'large'
}

interface StyledNumberProps {
  isOpen: boolean
}
