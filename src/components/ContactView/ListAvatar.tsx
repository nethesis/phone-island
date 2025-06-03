// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, ComponentProps } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import StatusBullet from './StatusBullet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'

const ListAvatar: FC<ListAvatarProps> = ({ username, status, placeHolderIcon, ...props }) => {
  const { avatars } = useSelector((state: RootState) => state.avatars)

  const hasValidAvatar = avatars && username && avatars[username]

  return (
    <div
      style={{
        ...(hasValidAvatar && {
          backgroundImage: `url(${avatars[username]})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }),
      }}
      data-stop-propagation={true}
      className={`pi-w-12 pi-h-12 pi-rounded-full pi-bg-gray-500 pi-flex-shrink-0 pi-relative`}
      {...props}
    >
      {hasValidAvatar ? (
        <div
          style={{
            backgroundImage: `url(${avatars[username]})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
          }}
          data-stop-propagation={true}
          className={`pi-w-12 pi-h-12 pi-rounded-full pi-bg-gray-500 pi-flex-shrink-0 pi-relative`}
          {...props}
        >
          <StatusBullet status={status} />
        </div>
      ) : (
        <div
          className={`pi-w-12 pi-h-12 pi-rounded-full pi-bg-gray-700 dark:pi-bg-gray-200 pi-flex-shrink-0 pi-relative pi-transition`}
          {...props}
        >
          <div className='pi-text-white dark:pi-text-gray-950 pi-w-full pi-h-full pi-fill-white pi-flex pi-justify-center pi-items-center'>
            <FontAwesomeIcon icon={placeHolderIcon} className='pi-h-6 pi-w-6' aria-hidden='true' />
            {status && <StatusBullet status={status} />}
          </div>
        </div>
      )}
    </div>
  )
}

interface ListAvatarProps extends ComponentProps<'div'> {
  username?: string
  status?: string
  placeHolderIcon: IconDefinition
}

export default ListAvatar
