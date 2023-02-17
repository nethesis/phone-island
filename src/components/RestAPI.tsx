// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, type FC, useEffect, useLayoutEffect } from 'react'
import { getCurrentUserInfo } from '../services/user'
import { retrieveAvatars } from '../lib/avatars/avatars'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../store'

export const RestAPI: FC<RestAPIProps> = ({ hostName, username, authToken, children }) => {
  const dispatch = useDispatch<Dispatch>()
  const { fetchReady } = useSelector((state: RootState) => state.fetchDefaults)

  useEffect(() => {
    if (username && authToken && hostName) {
      // Initialize API defaults
      dispatch.fetchDefaults.updateFetchBaseURL(`https://${hostName}/webrest`)
      dispatch.fetchDefaults.updateFetchHeaders({
        Authorization: `${username}:${authToken}`,
      })
      dispatch.fetchDefaults.setFetchReady()
    }
  }, [username, authToken, hostName])

  useEffect(() => {
    // Get users info and set to store
    async function initUserInfo() {
      const userInfo = await getCurrentUserInfo()
      if (userInfo != undefined) {
        dispatch.currentUser.updateCurrentUser(userInfo)
      }
    }
    if (fetchReady) {
      initUserInfo()
    }
  }, [fetchReady])

  useLayoutEffect(() => {
    // Initialize avatars request it or get from storage
    if (username && fetchReady) {
      retrieveAvatars(username)
    }
  }, [fetchReady])

  return <>{fetchReady && children}</>
}

interface RestAPIProps {
  children: ReactNode
  hostName: string
  username: string
  authToken: string
}
