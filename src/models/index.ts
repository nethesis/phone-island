import { Models } from '@rematch/core'
import { player } from './player'
import { webrtc } from './webrtc'
import { currentCall } from './currentCall'
import { currentUser } from './currentUser'
import { fetchDefaults } from './fetchDefaults'
import { island } from './island'

export interface RootModel extends Models<RootModel> {
  player: typeof player
  webrtc: typeof webrtc
  currentCall: typeof currentCall
  currentUser: typeof currentUser
  fetchDefaults: typeof fetchDefaults
  island: typeof island
}

export const models: RootModel = {
  player,
  webrtc,
  currentCall,
  currentUser,
  fetchDefaults,
  island
}
