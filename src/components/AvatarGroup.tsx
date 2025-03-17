// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

export interface AvatarGroupProps {
  usersList: Record<string, any> | null | undefined
  maxAvatars?: number
}

/**
 * Display a group of user avatars with a "+" indicator for additional users
 */
const AvatarGroup: FC<AvatarGroupProps> = ({ usersList, maxAvatars = 5 }) => {
  const { avatars } = useSelector((state: RootState) => state.avatars)
  const { extensions } = useSelector((state: RootState) => state.users)

  const users = usersList ? Object.values(usersList) : []
  const totalUsers = users.length
  const displayUsers = users.slice(0, maxAvatars)

  // Get user avatar URL
  const getAvatarUrl = (username: string | undefined): string | null => {

    if (!username || !avatars) return null

    // Try through extensions
    if (extensions && extensions[username]?.username && avatars[extensions[username].username]) {
      return `${avatars[extensions[username].username]}`
    }
    
    return null
  }

  // Helper function to generate initials from name
  const generateInitials = (name: string | undefined, username: string | undefined): string => {
    console.log("name", name)
    console.log("username", username)
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
    <div className='pi-flex pi-items-center pi-space-x-1'>
      {displayUsers.map((user: any, index) => {
        const username = user?.extenId || user?.id
        const avatarUrl = getAvatarUrl(username)
        const initials = generateInitials(user?.name, username)
        
        return (
          <div
            key={index}
            className='pi-inline-flex pi-items-center pi-justify-center pi-w-6 pi-h-6 pi-rounded-full pi-bg-gray-500'
          >
            {avatarUrl ? (
              <div
                className='pi-rounded-full pi-w-6 pi-h-6'
                style={{
                  backgroundImage: `url(${avatarUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  width: '100%',
                  height: '100%'
                }}
              />
            ) : (
              <span className='pi-text-xs pi-font-medium pi-text-white'>
                {initials}
              </span>
            )}
          </div>
        )
      })}

      {totalUsers > maxAvatars && (
        <span className='pi-inline-flex pi-items-center pi-justify-center pi-w-6 pi-h-6 pi-rounded-full pi-bg-gray-500'>
          <FontAwesomeIcon icon={faPlus} className='pi-text-xs pi-text-white' />
        </span>
      )}
    </div>
  )
}

export default AvatarGroup
