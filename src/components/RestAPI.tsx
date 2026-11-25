// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, type FC, useEffect, useLayoutEffect } from 'react'
import { getCurrentUserInfo, getVideoSources, getFeatureCodes } from '../services/user'
import { retrieveAvatars } from '../lib/avatars/avatars'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../store'
import { getAllExtensions } from '../services/astproxy'
import { getAllUsersEndpoints } from '../services/user'
import { getExtensionsList } from '../lib/user/extensions'
import { eventDispatch } from '../utils'

// Storage key used by older versions to save the API mode across sessions
const API_MODE_STORAGE_KEY = 'phone_island_api_mode'

// Probe attempts when the server cannot be reached
const API_PROBE_ATTEMPTS = 3
const API_PROBE_RETRY_DELAY = 2000
const API_PROBE_TIMEOUT = 5000

// Tokens issued by the middleware are JWTs, legacy ones are plain hashes
const isJwtToken = (token: string) => token.split('.').length === 3

// Export function to remove the API mode saved by older versions
export const resetApiMode = (username: string) => {
  try {
    localStorage.removeItem(`${API_MODE_STORAGE_KEY}_${username}`)
  } catch (error) {
    console.warn('Failed to reset API mode in localStorage:', error)
  }
}

export const RestAPI: FC<RestAPIProps> = ({ hostName, username, authToken, children }) => {
  const dispatch = useDispatch<Dispatch>()
  const { fetchReady } = useSelector((state: RootState) => state.fetchDefaults)

  useEffect(() => {
    if (authToken && hostName && username) {
      let cancelled = false

      const initializeAPI = async () => {
        // The mode is decided on every initialization: a value saved by an
        // older version must not skip the probe
        resetApiMode(username)
        let currentApiMode: 'new' | 'legacy' = 'new'

        for (let attempt = 1; attempt <= API_PROBE_ATTEMPTS; attempt++) {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), API_PROBE_TIMEOUT)
          try {
            const response = await fetch(`https://${hostName}/api/user/me`, {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
              signal: controller.signal,
            })

            if (response.status === 404) {
              // No middleware on the server: use the legacy API
              currentApiMode = 'legacy'
            } else if (response.status === 401) {
              // A legacy token passed by the host application selects the
              // legacy API, a rejected JWT is an expired session on the new API
              if (!isJwtToken(authToken)) {
                currentApiMode = 'legacy'
              }
            } else if (!response.ok) {
              throw new Error(`API test failed with status: ${response.status}`)
            }
            break
          } catch (error) {
            // Network error, timeout or server error: never select the legacy
            // API from it, retry and then keep the new API
            console.warn(`API mode probe failed (attempt ${attempt}):`, error)
            if (attempt < API_PROBE_ATTEMPTS) {
              await new Promise((resolve) => setTimeout(resolve, API_PROBE_RETRY_DELAY))
            }
          } finally {
            clearTimeout(timeout)
          }
          if (cancelled) return
        }
        if (cancelled) return

        dispatch.fetchDefaults.setApiMode(currentApiMode)

        // Set the appropriate configuration based on the determined mode
        if (currentApiMode === 'new') {
          dispatch.fetchDefaults.updateFetchBaseURL(`https://${hostName}/api`)
          dispatch.fetchDefaults.updateFetchHeaders({
            Authorization: `Bearer ${authToken}`,
          })
        } else {
          dispatch.fetchDefaults.updateFetchBaseURL(`https://${hostName}/webrest`)
          dispatch.fetchDefaults.updateFetchHeaders({
            Authorization: `${username}:${authToken}`,
          })
        }

        dispatch.fetchDefaults.setFetchReady()
      }

      initializeAPI()

      return () => {
        cancelled = true
      }
    }
  }, [authToken, hostName, username])

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
    // Get feature codes and save to store
    async function initFeatureCodes() {
      try {
        const codes = await getFeatureCodes()
        if (codes) {
          dispatch.currentUser.updateFeatureCodes(codes)
        }
      } catch (error) {
        console.warn('Failed to fetch feature codes:', error)
      }
    }
    // Call the needed APIs on startup
    if (fetchReady) {
      initCurrentUser()
      initUsersEndpoints()
      initVideoSources()
      initFeatureCodes()
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
