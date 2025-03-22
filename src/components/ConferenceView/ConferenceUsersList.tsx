// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMicrophone,
  faMicrophoneSlash,
  faPause,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import { useTranslation } from 'react-i18next'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import Timer from '../CallView/Timer'
import { muteUserConference, removeUserConference } from '../../lib/phone/call'

export interface ConferenceUsersListProps {}

export const ConferenceUsersList: FC<ConferenceUsersListProps> = ({}) => {
  const { usersList } = useSelector((state: RootState) => state.conference)
  const { isOwnerInside, conferenceId } = useSelector((state: RootState) => state.conference)
  const dispatch = useDispatch()

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

  const handleMuteParticipant = (userId: string, extensionId, isAlreadyMuted) => {
    dispatch.conference.toggleUserMuted({ extenId: extensionId })
    muteUserConference(conferenceId, userId, isAlreadyMuted)
  }

  const handleRemoveParticipant = (extenId: string) => {
    removeUserConference(conferenceId, extenId)
  }

  const UserAvatar = ({ user }: { user: any }) => (
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
  )

  return (
    <>
      <div className='pi-flex pi-flex-col pi-mt-2 pi-space-y-1 pi-max-h-28 pi-overflow-y-auto pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'>
        {usersList && Object?.keys(usersList)?.length > 0 ? (
          Object?.values(usersList)
            ?.filter((user) => !user?.owner)
            ?.map((user) => (
              <div
                key={`${user?.id}-${user?.extenId}`}
                className='pi-flex pi-items-center pi-justify-between pi-py-2 pi-px-3 pi-bg-gray-50 dark:pi-bg-gray-900 pi-rounded-lg'
              >
                <div className='pi-flex pi-items-center pi-gap-3 pi-truncate'>
                  <UserAvatar user={user} />
                  <span className='pi-font-medium pi-text-sm pi-text-gray-700 dark:pi-text-gray-200 pi-truncate pi-w-32'>
                    {user?.name}
                  </span>
                </div>
                {isOwnerInside ? (
                  <>
                    <Button
                      variant='transparent'
                      data-tooltip-id='conference-user-actions'
                      data-tooltip-content={
                        user?.muted
                          ? t('Conference.Unmute participant')
                          : t('Conference.Mute participant')
                      }
                      onClick={() => handleMuteParticipant(user?.id, user?.extenId, user?.muted)}
                    >
                      <FontAwesomeIcon
                        className={`pi-h-6 pi-w-6 ${
                          user?.muted ? 'pi-text-red-500' : 'pi-text-gray-600 dark:pi-text-gray-300'
                        }`}
                        icon={user?.muted ? faMicrophoneSlash : faMicrophone}
                      />
                    </Button>
                    <Button
                      variant='transparent'
                      data-tooltip-id='conference-user-actions'
                      data-tooltip-content={t('Conference.Remove participant')}
                      onClick={() => handleRemoveParticipant(user?.extenId)}
                    >
                      <FontAwesomeIcon
                        className='pi-h-6 pi-w-6 pi-text-gray-600 dark:pi-text-gray-300'
                        icon={faTrash}
                      />
                    </Button>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      className='pi-h-5 pi-w-5 pi-text-gray-600 dark:pi-text-gray-300'
                      icon={user.muted ? faMicrophoneSlash : faPause}
                    />
                    <Timer
                      size='small'
                      startTime={String(
                        Math?.floor(
                          user?.joinTime !== null && user?.joinTime ? user?.joinTime / 1000 : 0,
                        ),
                      )}
                      isNotAlwaysWhite
                      isInsideConference
                    />
                  </>
                )}
              </div>
            ))
        ) : (
          <div className='pi-flex pi-flex-col pi-justify-center pi-items-center pi-h-20 pi-text-gray-500 dark:pi-text-gray-400'>
            <span>{t('Conference.No participants yet')}</span>
            <span className='pi-text-xs pi-mt-1'>
              {t('Conference.Waiting for participants to join')}
            </span>
          </div>
        )}
      </div>
      <CustomThemedTooltip className='pi-z-1000' id='conference-user-actions' place='left' />
    </>
  )
}

export default ConferenceUsersList
