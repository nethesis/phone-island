// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical, faPause } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import { useTranslation } from 'react-i18next'
import { ConferenceUser } from '../../models/conference'
import { CustomThemedTooltip } from '../CustomThemedTooltip'

export interface ConferenceUsersListProps {}

export const ConferenceUsersList: FC<ConferenceUsersListProps> = ({}) => {
  const { usersList } = useSelector((state: RootState) => state.conference)

  const { avatars } = useSelector((state: RootState) => state.avatars)
  const { extensions } = useSelector((state: RootState) => state.users)
  const { t } = useTranslation()

  // Get user avatar URL
  const getAvatarUrl = (username: string | undefined): string | null => {
    if (!username || !avatars) return null

    // Try through extensions
    if (extensions && extensions[username]?.username && avatars[extensions[username].username]) {
      return `${avatars[extensions[username].username]}`
    }

    return null
  }

  // Generate initials from name
  const generateInitials = (name: string | undefined, username: string | undefined): string => {
    if (name) {
      return name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    } else if (username) {
      return username.substring(0, 2).toUpperCase()
    }
    return '??'
  }

  return (
    <>
      <div className='pi-flex pi-flex-col pi-mt-2 pi-space-y-1 pi-max-h-28 pi-overflow-y-auto pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'>
        {usersList && Object.keys(usersList).length > 0 ? (
          Object.values(usersList).map((user) => (
            <div
              key={user.id}
              className='pi-flex pi-items-center pi-justify-between pi-py-2 pi-px-3 pi-bg-gray-50 dark:pi-bg-gray-900 pi-rounded-lg'
            >
              <div className='pi-flex pi-items-center pi-gap-3 pi-truncate'>
                <div className='pi-inline-flex pi-items-center pi-justify-center pi-w-8 pi-h-8 pi-rounded-full pi-bg-gray-500'>
                  {getAvatarUrl(user.extenId) ? (
                    <div
                      className='pi-rounded-full pi-w-8 pi-h-8'
                      style={{
                        backgroundImage: `url(${getAvatarUrl(user?.extenId)})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                      }}
                    />
                  ) : (
                    <span className='pi-text-sm pi-font-medium pi-text-white'>
                      {generateInitials(user?.name, user?.extenId)}
                    </span>
                  )}
                </div>
                <span className='pi-font-medium pi-text-sm pi-text-gray-700 dark:pi-text-gray-200 pi-truncate pi-max-w-32'>
                  {user?.name}
                </span>
              </div>

              <div>
                <FontAwesomeIcon
                  className='pi-h-5 pi-w-5 pi-text-gray-600 dark:pi-text-gray-300'
                  icon={faPause}
                />
              </div>
            </div>
          ))
        ) : (
          <div className='pi-flex pi-justify-center pi-items-center pi-h-20 pi-text-gray-500 dark:pi-text-gray-400'>
            {t('Conference.No participants yet')}
          </div>
        )}
      </div>
      <CustomThemedTooltip className='pi-z-1000' id='conference-user-actions' place='left' />
    </>
  )
}

export default ConferenceUsersList
