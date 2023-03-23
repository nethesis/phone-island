// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { UserExtensionTypes } from "./user"

export interface UsersEndpointsTypes {
  [key: string]: UserEndpointsTypes
}

export interface UserEndpointsTypes {
  status: string | undefined
  "name": string
  "username": string
  "mainPresence": string
  "presence": string
  "endpoints": EndpointsTypes
  "presenceOnBusy": string
  "presenceOnUnavailable": string
  "recallOnBusy": string
}

export interface EndpointsTypes {
  email: {
    id?: string
    description?: string
  }[]
  jabber: {
    id: string
    server: string
  }[]
  extension: UserExtensionTypes[]
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
