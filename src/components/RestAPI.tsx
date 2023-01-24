// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, type FC, useEffect } from 'react'
import axios from 'axios'
import { getCurrentUserInfo } from '../services/user'
import { useDispatch, useSelector } from 'react-redux'

export const RestAPI: FC<RestAPIProps> = ({ hostName, username, authToken, children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Initialize axios
    axios.defaults.baseURL = `https://${hostName}/webrest`
    axios.defaults.headers.common['Authorization'] = `${username}:${authToken}`
    axios.defaults.headers.post['Content-Type'] = 'application/json'

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
