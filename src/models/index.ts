// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Models } from '@rematch/core'
import { player } from './player'
import { webrtc } from './webrtc'
import { currentCall } from './currentCall'
import { currentUser } from './currentUser'
import { fetchDefaults } from './fetchDefaults'
import { island } from './island'
import { paramUrl } from './paramUrl'
import { avatars } from './avatars'
import { users } from './users'
import { alerts } from './alerts'
import { motions } from './motions'
import { audioBars } from './audioBars'
import { recorder } from './recorder'
import { listen } from './listen'
import { darkTheme } from './darkTheme'
import { physicalRecorder } from './physicalRecorder'
import { screenShare } from './screenShare'
import { websocket } from './websocket'
import { mediaDevices } from './mediaDevices'
import { conference } from './conference'
import { streaming } from './streaming'
import { ringtones } from './ringtones'

export interface RootModel extends Models<RootModel> {
  player: typeof player
  webrtc: typeof webrtc
  conference: typeof conference
  currentCall: typeof currentCall
  currentUser: typeof currentUser
  fetchDefaults: typeof fetchDefaults
  island: typeof island
  paramUrl: typeof paramUrl
  avatars: typeof avatars
  users: typeof users
  alerts: typeof alerts
  motions: typeof motions
  audioBars: typeof audioBars
  recorder: typeof recorder
  listen: typeof listen
  darkTheme: typeof darkTheme
  screenShare: typeof screenShare
  websocket: typeof websocket
  physicalRecorder: typeof physicalRecorder
  mediaDevices: typeof mediaDevices
  streaming: typeof streaming
  ringtones: typeof ringtones
}

export const models: RootModel = {
  player,
  webrtc,
  conference,
  currentCall,
  currentUser,
  fetchDefaults,
  island,
  paramUrl,
  avatars,
  users,
  alerts,
  motions,
  audioBars,
  recorder,
  listen,
  darkTheme,
  screenShare,
  websocket,
  physicalRecorder,
  mediaDevices,
  streaming,
  ringtones,
}
