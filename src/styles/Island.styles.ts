// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled, { css } from 'styled-components'

export const StyledCallView = styled.div<StyledCallViewProps>`
  display: grid;
  align-items: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  ${({ isOpen, accepted, incoming, outgoing }) =>
    isOpen && accepted
      ? css`
          grid-template-rows: 72px 1fr;
        `
      : isOpen && incoming
      ? css`
          grid-template-columns: 256px 114px;
        `
      : isOpen &&
        outgoing &&
        css`
          grid-template-columns: 1fr 84px;
        `}
`

export const StyledTopContent = styled.div<StyledTopContentProps>`
  display: grid;
  grid-template-columns: ${({ isOpen, incoming, accepted, outgoing }) =>
    isOpen && !accepted && outgoing
      ? '48px 1fr'
      : isOpen && !accepted && incoming
      ? '48px 1fr 1px'
      : isOpen && accepted
      ? '48px 164px 48px'
      : !isOpen && !accepted
      ? '24px 102px'
      : '24px 66px 24px'};
  grid-gap: ${({ isOpen }) => (isOpen ? '20px' : '12px')};
  align-items: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  justify-content: center;
  width: 100%;
`

export const StyledAvatar = styled.div`
  object-fit: cover;
`

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

interface StyledCallViewProps {
  isOpen?: boolean
  incoming?: boolean
  openedIslandPadding?: number
  accepted?: boolean
  outgoing?: boolean
}

interface StyledTopContentProps {
  isOpen: boolean
  incoming: boolean
  accepted: boolean
  outgoing: boolean
}

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
