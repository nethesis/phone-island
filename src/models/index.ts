// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Models } from '@rematch/core'
import { player } from './player'
import { webrtc } from './webrtc'
import { currentCall } from './currentCall'
import { currentUser } from './currentUser'
import { fetchDefaults } from './fetchDefaults'
import { island } from './island'
import { avatars } from './avatars'
import { users } from './users'
import { alerts } from './alerts'
import { motions } from './motions'
import { audioBars } from './audioBars'
import { recorder } from './recorder'
import { listen } from './listen'

export interface RootModel extends Models<RootModel> {
  player: typeof player
  webrtc: typeof webrtc
  currentCall: typeof currentCall
  currentUser: typeof currentUser
  fetchDefaults: typeof fetchDefaults
  island: typeof island
  avatars: typeof avatars
  users: typeof users
  alerts: typeof alerts
  motions: typeof motions
  audioBars: typeof audioBars
  recorder: typeof recorder
  listen: typeof listen
}

export const models: RootModel = {
  player,
  webrtc,
  currentCall,
  currentUser,
  fetchDefaults,
  island,
  avatars,
  users,
  alerts,
  motions,
  audioBars,
  recorder,
  listen,
}
