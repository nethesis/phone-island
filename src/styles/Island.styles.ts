// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled, { css } from 'styled-components'

interface StyledDynamicIslandProps {
  isOpen: boolean
  incoming: boolean
  openedIslandPadding: number
  accepted: boolean
  outgoing: boolean
}

export const StyledDynamicIsland = styled.div<StyledDynamicIslandProps>`
  align-items: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  position: absolute;
  border-radius: 99px;
  background-color: #000;
  color: #fff;
  font-size: 0.75rem;
  display: grid;
  cursor: pointer;
  ${({ isOpen, accepted, incoming, outgoing }) =>
    isOpen && accepted
      ? css`
          grid-template-rows: 72px 1fr;
        `
      : isOpen &&
        (incoming || outgoing) &&
        css`
          grid-template-columns: 256px 114px;
        `}
`
interface StyledDynamicIslandTopContentProps {
  isOpen: boolean
  incoming: boolean
  accepted: boolean
  outgoing: boolean
}

export const StyledDynamicIslandTopContent = styled.div<StyledDynamicIslandTopContentProps>`
  display: grid;
  grid-template-columns: ${({ isOpen, incoming, accepted, outgoing }) =>
    isOpen && !accepted && (incoming || outgoing)
      ? '48px 1fr'
      : isOpen && accepted
      ? '48px 1fr 48px'
      : '12px 1fr 12px'};
  grid-gap: 20px;
  align-items: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  justify-content: center;
  width: 100%;
`

export const StyledAlbumArtThumb = styled.div`
  object-fit: cover;
`

export const StyledArtistDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 4px;
  align-items: center;
  justify-content: center;
  grid-template-rows: repeat(2, 1fr);
`
export const StyledArtistName = styled.div`
  font-size: 1rem;
  font-weight: 200;
  color: #fff;
  letter-spacing: 0.5px;
`

export const StyledSongName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
`
