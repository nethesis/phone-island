// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, type FC, useEffect } from 'react'
import { getCurrentUserInfo } from '../services/user'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'

export const RestAPI: FC<RestAPIProps> = ({ hostName, username, authToken, children }) => {
  const dispatch = useDispatch<Dispatch>()

  useEffect(() => {
    // Initialize axios
    dispatch.fetchDefaults.updateFetchBaseURL(`https://${hostName}/webrest`)
    dispatch.fetchDefaults.updateFetchHeaders({
      Authorization: `${username}:${authToken}`,
    })

    async function initUserInfo() {
      const userInfo = await getCurrentUserInfo()
      if (userInfo != undefined) {
        dispatch.currentUser.updateCurrentUser(userInfo)
      }
    }
    initUserInfo()
  }, [])

  return <>{children}</>
}

interface RestAPIProps {
  children: ReactNode
  hostName: string
  username: string
  authToken: string
}
