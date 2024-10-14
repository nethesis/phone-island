// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface AnnouncementInfoTypes {
  date_creation: string
  time_creation: string
  id: number
  username: string
  description: string
  privacy: 'private' | 'public'
}
