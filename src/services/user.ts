// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'

/**
 * Get current user info
 */
export async function getCurrentUserInfo(): Promise<UserInfoTypes | undefined> {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    const response = await fetch(`${baseURL}/user/me`, {
      headers: { ...headers },
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = await response.json()
    return data
  } catch (error: any) {
    throw new Error(error)
  }
}

export type ExtensinTypeTypes = 'webrtc' | 'physical'

export interface ExtensionTypes {
  id: string
  type: ExtensinTypeTypes
  secret: string
  username: string
  description: string
  actions: {
    answer: boolean
    dtmf: boolean
    hold: boolean
  }
  proxy_port: string | null
}

export interface PermissionTypes {
  [key: string]: {
    id: string
    name: string
    value: boolean
  }
}

export interface MacroPermissionTypes {
  [key: string]: {
    value: boolean
    permissions: PermissionTypes
  }
}

export interface RoutesPermissionsTypes {
  route_id: string
  name: string
  permission: boolean
}

export interface SettingTypes {
  desktop_notifications: boolean
  open_ccard: string
  default_extension: string
  ccard_order: string[]
  chat_notifications: boolean
  call_ringtone: boolean
  queue_auto_logout: boolean
  queue_auto_login: boolean
  auto_dndon_logout: boolean
  auto_dndoff_login: boolean
  open_param_url: string
  avatar: string
}

export interface UserInfoTypes {
  name?: string
  username?: string
  mainPresence?: string
  presence?: string
  endpoints?: {
    email: {
      id?: string
      description?: string
    }[]
    jabber: {
      id: string
      server: string
    }[]
    extension: ExtensionTypes[]
    cellphone: {
      id?: string
    }[]
    voicemail: {
      id?: string
    }[]
    mainextension: {
      id: string
      description: string
    }[]
  }
  presenceOnBusy?: string
  presenceOnUnavailable?: string
  recallOnBusy?: string
  profile?: {
    id: string
    name: string
    macro_permissions: MacroPermissionTypes
    outbound_routes_permissions: RoutesPermissionsTypes[]
  }
  default_device?: ExtensionTypes
  settings?: SettingTypes
}
