// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, type FC, useEffect, useLayoutEffect } from 'react'
import { getCurrentUserInfo, getVideoSources } from '../services/user'
import { retrieveAvatars } from '../lib/avatars/avatars'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../store'
import { getAllExtensions } from '../services/astproxy'
import { getAllUsersEndpoints } from '../services/user'
import { getExtensionsList } from '../lib/user/extensions'
import { eventDispatch } from '../utils'

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
    // Get all extensions info and set to store
    async function initExtensions() {
      const extensions = await getAllExtensions()
      if (extensions) {
        dispatch.users.updateExtensions(extensions)
        // Update the current user conversations
        const currentUserExtensionsList = getExtensionsList()
        const extensionsData = Object.values(extensions).filter((extension) =>
          currentUserExtensionsList.includes(extension.exten),
        )
        // Update the user conversations to store
        extensionsData.forEach((extension) => dispatch.currentUser.updateConversations(extension))
      }
    }
    // Get users info and set to store
    async function initCurrentUser() {
      const userInfo = await getCurrentUserInfo()
      if (userInfo) {
        dispatch.currentUser.updateCurrentUser(userInfo)
        eventDispatch('phone-island-user-informations-update', { ...userInfo })
        dispatch.currentUser.setCurrentUserReady(true)
        // Update open param URL type if it exists in paramurl store
        if (userInfo.settings && userInfo.settings.open_param_url) {
          dispatch.paramUrl.setOpenParamUrlType(userInfo.settings.open_param_url)
        } else {
          dispatch.paramUrl.setOpenParamUrlType('never')
        }

        // Inizialize all extensions after user initialization
        initExtensions()
      }
    }
    // Get all users and endpoints info and set to store
    async function initUsersEndpoints() {
      const usersEndpoints = await getAllUsersEndpoints()
      if (usersEndpoints) {
        dispatch.users.updateEndpoints(usersEndpoints)
      }
    }
    // Get all streaming source info and set to store
    async function initVideoSources() {
      const videoSources: any = await getVideoSources()
      if (videoSources) {
        dispatch.streaming.updateVideoSources(videoSources)
      }
    }
    // Call the needed APIs on startup
    if (fetchReady) {
      initCurrentUser()
      initUsersEndpoints()
      initVideoSources()
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
