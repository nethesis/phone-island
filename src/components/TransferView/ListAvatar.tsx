// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, ComponentProps } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

const ListAvatar: FC<ListAvatarProps> = ({ username, status, ...props }) => {
  const { avatars } = useSelector((state: RootState) => state.avatars)

  return (
    <div
      style={{
        backgroundImage: `url(${avatars && username && avatars[username] && avatars[username]})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
      }}
      data-stop-propagation={true}
      className={`pi-w-12 pi-h-12 pi-rounded-full pi-bg-gray-200 pi-flex-shrink-0 pi-relative pi-transition ${
        status === 'online' ? 'hover:pi-scale-110' : ''
      }`}
      {...props}
    >
      {/* The status bullet */}
      {status && (
        <span
          style={{ right: '1px', bottom: '1px' }}
          className={`pi-absolute pi-rounded-full pi-w-3 pi-h-3 pi-z-20 ${
            status === 'online' ||
            status === 'voicemail' ||
            status === 'cellphone' ||
            status === 'callforward'
              ? 'pi-bg-green-500'
              : status === 'busy' || status === 'incoming' || status === 'ringing'
              ? 'pi-bg-red-500'
              : status === 'dnd'
              ? 'pi-bg-gray-950'
              : status === 'offline'
              ? 'pi-bg-gray-500'
              : ''
          } pi-border-2 pi-border-white`}
        ></span>
      )}
    </div>
  )
}

interface ListAvatarProps extends ComponentProps<'div'> {
  username?: string
  status?: string
}

export default ListAvatar
