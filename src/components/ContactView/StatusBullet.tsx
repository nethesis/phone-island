// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, ComponentProps } from 'react'

const StatusBullet: FC<StatusBulletProps> = ({ status, ...props }) => {
  return (
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
  )
}

interface StatusBulletProps extends ComponentProps<'div'> {
  status?: string
}

export default StatusBullet
