// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { GenericAvatar } from '../GenericAvatar'
import { resolveUsernameByNumber } from '../../lib/phone/conversation'

const Avatar: FC = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { avatars } = useSelector((state: RootState) => state.avatars)
  const { extensions } = useSelector((state: RootState) => state.users)
  const {
    username,
    number,
    incoming,
    outgoing,
    accepted,
    transferring,
  } = useSelector((state: RootState) => state.currentCall)

  const resolvedUsername = useMemo(
    () => username || resolveUsernameByNumber(number, extensions),
    [username, number, extensions],
  )

  const avatarUrl = useMemo(() => {
    if (transferring && number) {
      const transferringUsername = resolveUsernameByNumber(number, extensions)
      return transferringUsername ? avatars?.[transferringUsername] : undefined
    }

    return resolvedUsername ? avatars?.[resolvedUsername] : undefined
  }, [avatars, resolvedUsername, transferring, number, extensions])

  const showPulseEffect = incoming || (outgoing && !accepted)

  return (
    <GenericAvatar
      avatarUrl={avatarUrl}
      size={isOpen ? 'open' : 'closed'}
      showPulseEffect={showPulseEffect}
      pulseColor='pi-bg-gray-600'
      backgroundColorClass='pi-bg-secondaryNeutral dark:pi-bg-secondaryNeutralDark'
      borderRadius='pi-rounded-xl'
      className={isOpen ? 'pi--mt-1' : ''}
    />
  )
}

export default Avatar
