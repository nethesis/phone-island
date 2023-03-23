// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, type FC, useEffect, useLayoutEffect } from 'react'
import { getCurrentUserInfo } from '../services/user'
import { retrieveAvatars } from '../lib/avatars/avatars'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../store'
import { getAllExtensions } from '../services/astproxy'
import { getAllUsersEndpoints } from '../services/user'

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
    async function initCurrentUser() {
      const userInfo = await getCurrentUserInfo()
      if (userInfo) {
        dispatch.currentUser.updateCurrentUser(userInfo)
        dispatch.currentUser.setCurrentUserReady(true)
      }
    }
    // Get all extensions info and set to store
    async function initExtensions() {
      const extensions = await getAllExtensions()
      if (extensions) {
        dispatch.users.updateExtensions(extensions)
      }
    }
    // Get all users and endpoints info and set to store
    async function initUsersEndpoints() {
      const usersEndpoints = await getAllUsersEndpoints()
      if (usersEndpoints) {
        dispatch.users.updateEndpoints(usersEndpoints)
      }
    }
    // Call the needed APIs on startup
    if (fetchReady) {
      initCurrentUser()
      initExtensions()
      initUsersEndpoints()
    }
  }, [fetchReady])

  useLayoutEffect(() => {
    // Initialize avatars request it or get from storage
    if (username && fetchReady) {
      retrieveAvatars(username)
    }
  }, [fetchReady, username])

  return <>{fetchReady && children}</>
}

interface RestAPIProps {
  children: ReactNode
  hostName: string
  username: string
  authToken: string
}
