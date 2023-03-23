// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { AvatarsTypes } from './avatars'
import { EndpointsTypes } from './endpoints'

export interface UserCachesTypes {
  operatorsAvatars: AvatarsTypes
}

export type ExtensionTypeTypes = 'webrtc' | 'physical'

export interface UserExtensionTypes {
  id: string
  type: ExtensionTypeTypes
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
  endpoints?: EndpointsTypes
  presenceOnBusy?: string
  presenceOnUnavailable?: string
  recallOnBusy?: string
  profile?: {
    id: string
    name: string
    macro_permissions: MacroPermissionTypes
    outbound_routes_permissions: RoutesPermissionsTypes[]
  }
  default_device?: UserExtensionTypes
  settings?: SettingTypes
}
