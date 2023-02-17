// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface MainPresenceEventTypes {
  [username: string]: {
    mainPresence: string
  }
}

export interface MainPresenceTypes {
  mainPresence: {
    status: string
    username: string
  }
}
