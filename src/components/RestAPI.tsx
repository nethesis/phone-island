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

// Storage key for API mode
const API_MODE_STORAGE_KEY = 'phone_island_api_mode'

// Function to get saved API mode from localStorage
const getSavedApiMode = (username: string): 'new' | 'legacy' | 'unknown' => {
  try {
    const saved = localStorage.getItem(`${API_MODE_STORAGE_KEY}_${username}`)
    if (saved === 'new' || saved === 'legacy') {
      return saved
    }
  } catch (error) {
    console.warn('Failed to read API mode from localStorage:', error)
  }
  return 'unknown'
}

// Function to save API mode to localStorage
const saveApiMode = (username: string, mode: 'new' | 'legacy') => {
  try {
    localStorage.setItem(`${API_MODE_STORAGE_KEY}_${username}`, mode)
  } catch (error) {
    console.warn('Failed to save API mode to localStorage:', error)
  }
}

// Export function to get current API mode from localStorage
export const getApiMode = (username: string) => getSavedApiMode(username)

// Export function to reset API mode (useful for error recovery)
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
      const initializeAPI = async () => {
        let currentApiMode = getSavedApiMode(username)

        // If mode is unknown or we need to test, probe the API
        if (currentApiMode === 'unknown') {
          // First time or after reset: test new API format
          try {
            const response = await fetch(`https://${hostName}/api/user/me`, {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            })

            if (response.ok) {
              // New API format works
              currentApiMode = 'new'
              saveApiMode(username, 'new')
            } else if (response.status === 404 || response.status === 401) {
              // Fallback to legacy API format
              currentApiMode = 'legacy'
              saveApiMode(username, 'legacy')
            } else {
              throw new Error(`API test failed with status: ${response.status}`)
            }
          } catch (error) {
            // Network error or other issues, fallback to legacy API
            currentApiMode = 'legacy'
            saveApiMode(username, 'legacy')
          }
        }

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
